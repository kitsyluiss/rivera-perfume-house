"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface PaymentMethod {
  id: string;
  provider_name: string;
  account_name: string;
  account_number: string;
  qr_code_url: string | null;
  is_active: boolean;
  created_at: string;
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

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
  const supabase = await createClient();
  const { error } = await supabase.from("payment_methods").insert({
    provider_name: providerName,
    account_name: accountName,
    account_number: accountNumber,
    qr_code_url: qrCodeUrl,
    is_active: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/checkout/success");
}

export async function togglePaymentMethod(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_methods")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/checkout/success");
}

export async function deletePaymentMethod(id: string, qrCodeUrl: string | null) {
  const supabase = await createClient();
  
  if (qrCodeUrl) {
    // Attempt to extract the path from the URL.
    // Example: https://<project>.supabase.co/storage/v1/object/public/payment_qrs/filename.png
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
  }

  const { error } = await supabase.from("payment_methods").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/checkout/success");
}
