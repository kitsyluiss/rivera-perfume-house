"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAddresses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAddress(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const address = {
    user_id: user.id,
    full_name: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    province: String(formData.get("province") ?? ""),
    postal_code: String(formData.get("postal_code") ?? ""),
    is_default: formData.get("is_default") === "true",
  };

  const { data, error } = await supabase
    .from("addresses")
    .insert(address)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createOrder(addressId: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Get cart items
  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select(`
      id, quantity, perfume_id,
      perfume:perfumes ( brand, scent_name, target_sale_price, cost_price, image_url, quantity, flash_sale_price, flash_sale_end )
    `)
    .eq("user_id", user.id);

  if (cartError) throw new Error(cartError.message);
  if (!cartItems || cartItems.length === 0) throw new Error("Cart is empty");

  // Verify stock
  for (const item of cartItems) {
    const perfume = item.perfume as any;
    if (perfume.quantity < item.quantity) {
      throw new Error(`Only ${perfume.quantity} units left of ${perfume.scent_name}`);
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const perfume = item.perfume as any;
    const hasFlashSale = perfume.flash_sale_price != null && 
      perfume.flash_sale_end != null && 
      new Date(perfume.flash_sale_end) > new Date();
    const price = hasFlashSale ? perfume.flash_sale_price : perfume.target_sale_price;
    return sum + price * item.quantity;
  }, 0);
  const shipping_fee = 0; // Flat rate or calculated
  const total = subtotal + shipping_fee;

  // 2. Create Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      address_id: addressId,
      status: "pending_verification",
      subtotal,
      shipping_fee,
      total,
    })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  // 3. Create Order Items
  const orderItemsInsert = cartItems.map((item) => {
    const perfume = item.perfume as any;
    return {
      order_id: order.id,
      perfume_id: item.perfume_id,
      quantity: item.quantity,
      unit_price: (() => {
        const hasFlashSale = perfume.flash_sale_price != null && 
          perfume.flash_sale_end != null && 
          new Date(perfume.flash_sale_end) > new Date();
        return hasFlashSale ? perfume.flash_sale_price : perfume.target_sale_price;
      })(),
      cost_price: perfume.cost_price,
      brand: perfume.brand,
      scent_name: perfume.scent_name,
      image_url: perfume.image_url,
    };
  });

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsInsert);

  if (itemsError) throw new Error(itemsError.message);

  // 4. Clear Cart
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  // 5. Revalidate
  revalidatePath("/cart");
  revalidatePath("/orders");
  revalidatePath("/admin");

  return order.id;
}
