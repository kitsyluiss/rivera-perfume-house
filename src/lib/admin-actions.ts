"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Order, OrderStatus } from "@/lib/types";

export async function getAdminOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin only");
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      address:addresses (*),
      items:order_items (*),
      customer:profiles!orders_user_id_fkey (display_name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    ...row,
    customer_name: row.customer?.display_name,
  }));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin only");
  }

  // If changing to 'paid', we need to record sales
  if (status === "paid") {
    // 1. Get current order to make sure it wasn't already paid
    const { data: order } = await supabase
      .from("orders")
      .select("status, items:order_items(*)")
      .eq("id", orderId)
      .single();

    if (order && order.status === "pending_verification") {
      // 2. Create sale records (inventory already deducted at checkout)
      for (const item of order.items || []) {
        const perfumeId = item.perfume_id;
        
        if (perfumeId) {
          // Record sale
          await supabase.from("sales").insert({
            user_id: user.id, // Admin who verified
            perfume_id: perfumeId,
            quantity_sold: item.quantity,
            unit_price: item.unit_price,
            cost_at_sale: item.cost_price,
            customer_name: `Order #${orderId.split("-")[0].toUpperCase()}`,
            notes: "Website Order"
          });
        }
      }
    }
  }

  // If changing to 'cancelled', we need to restock inventory and remove sales if it was paid
  if (status === "cancelled") {
    const { data: order } = await supabase
      .from("orders")
      .select("status, items:order_items(*)")
      .eq("id", orderId)
      .single();

    if (order && order.status !== "cancelled") {
      // If it was already paid, shipped, or delivered, we must delete the sales records
      if (["paid", "shipped", "delivered"].includes(order.status)) {
        await supabase
          .from("sales")
          .delete()
          .eq("customer_name", `Order #${orderId.split("-")[0].toUpperCase()}`);
      }

      // Restock inventory for all items
      for (const item of order.items || []) {
        const perfumeId = item.perfume_id;
        if (perfumeId) {
          const { data: perfume } = await supabase
            .from("perfumes")
            .select("quantity")
            .eq("id", perfumeId)
            .single();

          if (perfume) {
            await supabase
              .from("perfumes")
              .update({ quantity: perfume.quantity + item.quantity })
              .eq("id", perfumeId);
          }
        }
      }
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function uploadReceipt(orderId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin only");
  }

  const file = formData.get("receipt") as File;
  if (!file) throw new Error("No file provided");

  const ext = file.name.split(".").pop();
  const fileName = `${orderId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(fileName, file);

  if (uploadError) throw new Error("Upload failed: " + uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from("receipts")
    .getPublicUrl(fileName);

  const { error: dbError } = await supabase
    .from("orders")
    .update({ receipt_url: publicUrl })
    .eq("id", orderId);

  if (dbError) throw new Error("Database update failed: " + dbError.message);

  revalidatePath("/admin");
}
