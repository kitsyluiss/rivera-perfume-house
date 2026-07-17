"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCartItems() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      perfume_id,
      perfume:perfumes (
        id,
        brand,
        scent_name,
        target_sale_price,
        flash_sale_price,
        flash_sale_end,
        image_url,
        quantity
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addToCart(perfumeId: string, quantity: number = 1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("You must be logged in to add items to your cart.");
  }

  // Check if it exists
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("perfume_id", perfumeId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({
        user_id: user.id,
        perfume_id: perfumeId,
        quantity
      });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/cart");
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/cart");
}

export async function removeFromCart(cartItemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/cart");
}

export async function clearCart() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/cart");
}
