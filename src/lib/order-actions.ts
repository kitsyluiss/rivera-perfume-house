"use server";

import { createClient } from "@/lib/supabase/server";
import { Order } from "@/lib/types";

export async function getCustomerOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      address:addresses (*),
      items:order_items (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function cancelOrder(orderId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify the order belongs to the user and is still pending
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (fetchError) throw new Error("Order not found");
  if (order.status !== "pending_verification") {
    throw new Error("Only pending orders can be cancelled");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}
