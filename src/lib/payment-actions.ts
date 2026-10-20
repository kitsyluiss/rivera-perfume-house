"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { paymentMethodSchema } from "./validations";
import { logger } from "./logger";

export interface PaymentMethod {
  id: string;
  provider_name: string;
  account_name: string;
  account_number: string;
  qr_code_url: string | null;
  is_active: boolean;
  created_at: string;
}

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin privilege required");
  }
  return { supabase, user };
}

export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  const { supabase } = await verifyAdmin();

  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addPaymentMethod(
  providerName: string,
  accountName: string,
  accountNumber: string,
  qrCodeUrl: string | null
) {
  const parsed = paymentMethodSchema.safeParse({
    provider_name: providerName,
    account_name: accountName,
    account_number: accountNumber,
    qr_code_url: qrCodeUrl,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid payment method parameters");
  }

  const { supabase, user } = await verifyAdmin();
  const { error } = await supabase.from("payment_methods").insert({
    provider_name: parsed.data.provider_name,
    account_name: parsed.data.account_name,
    account_number: parsed.data.account_number,
    qr_code_url: parsed.data.qr_code_url ?? null,
    is_active: true,
  });

  if (error) throw new Error(error.message);

  await logger.info("payment_method_added", {
    provider: parsed.data.provider_name,
    adminId: user.id,
  });

  revalidatePath("/admin");
  revalidatePath("/checkout/success");
}

export async function togglePaymentMethod(id: string, isActive: boolean) {
  const { supabase } = await verifyAdmin();
  const { error } = await supabase
    .from("payment_methods")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/checkout/success");
}

export async function deletePaymentMethod(id: string, qrCodeUrl: string | null) {
  const { supabase } = await verifyAdmin();
  
  if (qrCodeUrl) {
    try {
      const urlObj = new URL(qrCodeUrl);
      const pathParts = urlObj.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
        const bucketName = pathParts[publicIndex + 1];
        const fileName = pathParts.slice(publicIndex + 2).join('/');
        if (bucketName === 'payment_qrs') {
          await supabase.storage.from("payment_qrs").remove([fileName]);
        }
      }
    } catch {
      // Ignore URL parse errors
    }
  }

  const { error } = await supabase.from("payment_methods").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/checkout/success");
}
