"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { addToCartSchema } from "./validations";
import { logger } from "./logger";

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

  if (error) return { error: error.message };

  if (data && data.length > 0) {
    // Fetch total quantity for each brand/scent combo to avoid the duplicate stock bug
    const { data: allStock } = await supabase.from("perfumes").select("brand, scent_name, quantity");
    if (allStock) {
      for (const item of data) {
        if (item.perfume) {
          const totalQty = allStock
            .filter(p => p.brand === (item.perfume as any).brand && p.scent_name === (item.perfume as any).scent_name)
            .reduce((sum, p) => sum + p.quantity, 0);
          (item.perfume as any).quantity = totalQty;
        }
      }
    }
  }

  return data ?? [];
}

export async function addToCart(perfumeId: string, quantity: number = 1) {
  const parsed = addToCartSchema.safeParse({ perfumeId, quantity });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid cart item parameters" };
  }

  const validPerfumeId = parsed.data.perfumeId;
  const validQuantity = parsed.data.quantity;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "You must be logged in to add items to your cart." };
  }

  // Check if it exists
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("perfume_id", validPerfumeId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + validQuantity })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({
        user_id: user.id,
        perfume_id: validPerfumeId,
        quantity: validQuantity
      });
    if (error) return { error: error.message };
  }

  await logger.info("cart_item_added", { userId: user.id, perfumeId: validPerfumeId, quantity: validQuantity });
  revalidatePath("/");
  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(cartItemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/cart");
  return { success: true };
}

export async function clearCart() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/cart");
  return { success: true };
}
