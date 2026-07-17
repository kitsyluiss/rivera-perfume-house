"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Perfume, Sale } from "@/lib/types";

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // Create profile upon first login if it doesn't exist
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      const displayName = data.user.user_metadata?.display_name || email.split("@")[0];
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: displayName,
        role: "customer",
      });
    }
  }
  return { success: true };
}

export async function signUp(email: string, password: string, name: string, redirectUrl: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }

  const supabase = await createClient();
  const { error: signUpError, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name.trim(),
      },
      emailRedirectTo: redirectUrl,
    },
  });
  if (signUpError) return { error: signUpError.message };
  
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "Email address already registered" };
  }

  if (data.session && data.user) {
    // If email confirmation is disabled, the user is logged in immediately.
    // We can insert their profile now since they have a valid session.
    await supabase.from("profiles").upsert({
      id: data.user.id,
      display_name: name.trim(),
      role: "customer",
    });
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function sendPasswordReset(email: string, redirectUrl: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: password,
  });
  if (error) return { error: error.message };
  return { success: true };
}

// ─── Profile ───────────────────────────────────────────────────────────────────

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .single();

  return data ?? null;
}

export async function upsertProfile(displayName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName.trim() || "Admin",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

// ─── Perfumes ──────────────────────────────────────────────────────────────────

export async function getPerfumes(): Promise<Perfume[]> {
  const supabase = await createClient();

  const { data: perfumesData, error } = await supabase
    .from("perfumes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Fetch profiles to resolve added_by display names
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, display_name");

  const profileMap = new Map(
    (profilesData ?? []).map((p: { id: string; display_name: string }) => [
      p.id,
      p.display_name,
    ])
  );

  return (perfumesData ?? []).map((row: any) => ({
    id: row.id,
    brand: row.brand,
    scent_name: row.scent_name,
    season: row.season,
    quantity: row.quantity,
    cost_price: row.cost_price,
    target_sale_price: row.target_sale_price,
    image_url: row.image_url,
    created_at: row.created_at,
    user_id: row.user_id,
    added_by: row.user_id
      ? (profileMap.get(row.user_id as string) ?? null)
      : null,
  }));
}


export async function addPerfume(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const brand = String(formData.get("brand") ?? "");
  const scent_name = String(formData.get("scent_name") ?? "");
  const tag = String(formData.get("tag") ?? formData.get("season") ?? "");
  const quantity = Number(formData.get("quantity"));
  const cost_price = Number(formData.get("cost_price"));
  const target_sale_price = Number(formData.get("target_sale_price"));
  const image = formData.get("image") as File | null;

  let image_url: string | null = null;

  if (image && image.size > 0) {
    const ext = image.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("perfume_images")
      .upload(fileName, image, { cacheControl: "3600", upsert: false });

    if (uploadError) throw new Error(uploadError.message);

    const {
      data: { publicUrl },
    } = supabase.storage.from("perfume_images").getPublicUrl(fileName);

    image_url = publicUrl;
  } else {
    // Restock mode: carry existing image URL without re-uploading
    const existingUrl = String(formData.get("existing_image_url") ?? "");
    if (existingUrl) image_url = existingUrl;
  }

  const { error } = await supabase.from("perfumes").insert({
    user_id: user.id, // ← stamp owner
    brand,
    scent_name,
    season: tag || null,
    quantity,
    cost_price,
    target_sale_price,
    image_url,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updatePerfume(id: string, updates: Record<string, unknown>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("perfumes").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updatePerfumePhoto(id: string, image: File) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get current perfume info to resolve old image and match name/brand
  const { data: perfume, error: fetchError } = await supabase
    .from("perfumes")
    .select("brand, scent_name, image_url")
    .eq("id", id)
    .single();

  if (fetchError || !perfume) throw new Error("Perfume not found");

  // Optional: delete old image from storage if it exists
  if (perfume.image_url) {
    try {
      const oldFileName = perfume.image_url.split("/").pop();
      if (oldFileName) {
        await supabase.storage.from("perfume_images").remove([oldFileName]);
      }
    } catch {
      // Ignore storage deletion errors
    }
  }

  // Upload new image
  const ext = image.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("perfume_images")
    .upload(fileName, image, { cacheControl: "3600", upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("perfume_images").getPublicUrl(fileName);

  // Update image url for all records sharing the same brand and scent name
  const { error: updateError } = await supabase
    .from("perfumes")
    .update({ image_url: publicUrl })
    .eq("brand", perfume.brand)
    .eq("scent_name", perfume.scent_name);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deletePerfume(id: string, imageUrl?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  if (imageUrl) {
    const path = imageUrl.split("/perfume_images/")[1];
    if (path) await supabase.storage.from("perfume_images").remove([path]);
  }

  const { error } = await supabase.from("perfumes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function setFlashSale(id: string, flashSalePrice: number | null, flashSaleEnd: string | null, flashSaleStock?: number | null, flashSaleName?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  
  // Verify user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized: Admins only");

  const { data: perfume } = await supabase.from("perfumes").select("brand, scent_name").eq("id", id).single();
  if (!perfume) throw new Error("Perfume not found");

  const { error } = await supabase
    .from("perfumes")
    .update({ 
      flash_sale_price: flashSalePrice, 
      flash_sale_end: flashSaleEnd,
      flash_sale_stock: flashSaleStock ?? null,
      flash_sale_name: flashSaleName ?? null
    })
    .eq("brand", perfume.brand)
    .eq("scent_name", perfume.scent_name);

  if (error) throw new Error(error.message);
  
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function setBulkFlashSale(ids: string[], discountPercent: number, flashSaleEnd: string | null, flashSaleName?: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized: Admins only");

  // Fetch target perfumes to get their brands and scents
  const { data: perfumes } = await supabase.from("perfumes").select("brand, scent_name, target_sale_price").in("id", ids);
  if (!perfumes || perfumes.length === 0) return;

  // We want to apply the discount to ALL rows that match the selected brands + scent names
  for (const perfume of perfumes) {
    const discountedPrice = Math.floor(perfume.target_sale_price * (1 - discountPercent / 100));
    
    await supabase.from("perfumes").update({
      flash_sale_price: discountedPrice,
      flash_sale_end: flashSaleEnd,
      flash_sale_stock: null, // Bulk doesn't set specific stock limits
      flash_sale_name: flashSaleName ?? null
    })
    .eq("brand", perfume.brand)
    .eq("scent_name", perfume.scent_name);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export async function recordSale(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const perfume_id = String(formData.get("perfume_id") ?? "");
  const quantity_sold = Number(formData.get("quantity_sold"));
  const unit_price = Number(formData.get("unit_price"));
  const customer_name = String(formData.get("customer_name") ?? "") || null;
  const notes = String(formData.get("notes") ?? "") || null;

  if (!perfume_id || !quantity_sold || !unit_price) {
    throw new Error("Missing required fields");
  }

  // Fetch current perfume to get cost and check stock
  const { data: perfume, error: fetchError } = await supabase
    .from("perfumes")
    .select("quantity, cost_price")
    .eq("id", perfume_id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!perfume) throw new Error("Perfume not found");
  if (perfume.quantity < quantity_sold) {
    throw new Error(`Only ${perfume.quantity} units in stock`);
  }

  // Record the sale — stamped to this admin
  const { error: saleError } = await supabase.from("sales").insert({
    user_id: user.id, // ← profit attributed to this admin
    perfume_id,
    quantity_sold,
    unit_price,
    cost_at_sale: perfume.cost_price,
    customer_name,
    notes,
  });

  if (saleError) throw new Error(saleError.message);

  // Decrement inventory
  const { error: updateError } = await supabase
    .from("perfumes")
    .update({ quantity: perfume.quantity - quantity_sold })
    .eq("id", perfume_id);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function getSales(): Promise<Sale[]> {
  const supabase = await createClient();

  // RLS `sales_read_own` automatically filters to the current user's sales
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      perfume:perfumes!sales_perfume_id_fkey (
        brand,
        scent_name,
        image_url
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((sale: Record<string, unknown>) => {
    const perfume = sale.perfume as Record<string, unknown> | null;
    return {
      id: sale.id as string,
      perfume_id: sale.perfume_id as string,
      quantity_sold: sale.quantity_sold as number,
      unit_price: sale.unit_price as number,
      cost_at_sale: sale.cost_at_sale as number,
      customer_name: sale.customer_name as string | null,
      notes: sale.notes as string | null,
      created_at: sale.created_at as string,
      brand: perfume?.brand as string | undefined,
      scent_name: perfume?.scent_name as string | undefined,
      image_url: (perfume?.image_url as string | null) ?? null,
    };
  });
}

export async function deleteSale(saleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Fetch the sale to restore inventory
  const { data: sale, error: fetchError } = await supabase
    .from("sales")
    .select("perfume_id, quantity_sold")
    .eq("id", saleId)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!sale) throw new Error("Sale not found");

  // Restore inventory
  const { data: perfume } = await supabase
    .from("perfumes")
    .select("quantity")
    .eq("id", sale.perfume_id)
    .single();

  if (perfume) {
    await supabase
      .from("perfumes")
      .update({ quantity: perfume.quantity + sale.quantity_sold })
      .eq("id", sale.perfume_id);
  }

  // Delete the sale record (RLS ensures only owner can delete)
  const { error } = await supabase.from("sales").delete().eq("id", saleId);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin");
}