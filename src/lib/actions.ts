"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Perfume, Sale } from "@/lib/types";
import { getAvifUrl } from "./get-avif";
import { logger } from "./logger";
import {
  signInSchema,
  signUpSchema,
  passwordResetSchema,
  updatePasswordSchema,
  addPerfumeSchema,
  updatePerfumeSchema,
  flashSaleSchema,
  bulkFlashSaleSchema,
  recordSaleSchema,
} from "./validations";

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const parsed = signInSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    await logger.warn("auth_sign_in_failed", { email: parsed.data.email, error: error.message });
    return { error: error.message };
  }

  await logger.info("auth_sign_in_success", { userId: data.user?.id });

  // Create profile upon first login if it doesn't exist
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      const displayName = data.user.user_metadata?.display_name || parsed.data.email.split("@")[0];
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
  const parsed = signUpSchema.safeParse({ email, password, name, redirectUrl });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error: signUpError, data } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.name,
      },
      emailRedirectTo: parsed.data.redirectUrl,
    },
  });

  if (signUpError) {
    await logger.warn("auth_sign_up_failed", { email: parsed.data.email, error: signUpError.message });
    return { error: signUpError.message };
  }
  
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "Email address already registered" };
  }

  if (data.session && data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      display_name: parsed.data.name,
      role: "customer",
    });
  }

  await logger.info("auth_sign_up_success", { userId: data.user?.id });
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await logger.info("auth_sign_out");
}

export async function sendPasswordReset(email: string, redirectUrl: string) {
  const parsed = passwordResetSchema.safeParse({ email, redirectUrl });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: parsed.data.redirectUrl,
  });
  if (error) {
    await logger.warn("auth_password_reset_failed", { email: parsed.data.email, error: error.message });
    return { error: error.message };
  }

  await logger.info("auth_password_reset_sent", { email: parsed.data.email });
  return { success: true };
}

export async function updatePassword(password: string) {
  const parsed = updatePasswordSchema.safeParse({ password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Password must be at least 6 characters" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  await logger.info("auth_password_updated");
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

async function requireAdmin(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: Admins only");
  }
}

export async function getPerfumes(): Promise<Perfume[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  await requireAdmin(supabase, user.id);

  const { data: perfumesData, error } = await supabase
    .from("perfumes")
    .select("*")
    .eq("user_id", user.id)
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
    flash_sale_price: row.flash_sale_price,
    flash_sale_end: row.flash_sale_end,
    flash_sale_stock: row.flash_sale_stock,
    flash_sale_name: row.flash_sale_name,
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
  await requireAdmin(supabase, user.id);

  const rawInput = {
    brand: formData.get("brand"),
    scent_name: formData.get("scent_name"),
    season: formData.get("tag") ?? formData.get("season") ?? null,
    quantity: formData.get("quantity"),
    cost_price: formData.get("cost_price"),
    target_sale_price: formData.get("target_sale_price"),
  };

  const parsed = addPerfumeSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid perfume details" };
  }

  const { brand, scent_name, season, quantity, cost_price, target_sale_price } = parsed.data;
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
    season: season || null,
    quantity,
    cost_price,
    target_sale_price,
    image_url,
  });

  if (error) {
    await logger.error("perfume_add_db_error", { error: error.message, brand, scent_name });
    return { error: error.message };
  }

  await logger.info("perfume_added", { brand, scent_name, quantity, adminId: user.id });
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function updatePerfume(id: string, updates: Record<string, unknown>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  await requireAdmin(supabase, user.id);

  const parsed = updatePerfumeSchema.safeParse(updates);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid perfume updates");
  }
  const sanitizedUpdates: Record<string, unknown> = parsed.data;

  // 1. Fetch current perfume info to get brand & scent name
  const { data: perfume } = await supabase
    .from("perfumes")
    .select("brand, scent_name")
    .eq("id", id)
    .single();

  // 2. Update the target row
  const { error } = await supabase.from("perfumes").update(sanitizedUpdates).eq("id", id);
  if (error) throw new Error(error.message);

  // 3. Sync pricing/season/image changes across all matching bottles in the database
  if (perfume && (sanitizedUpdates.target_sale_price !== undefined || sanitizedUpdates.cost_price !== undefined || sanitizedUpdates.season !== undefined || sanitizedUpdates.image_url !== undefined)) {
    const syncPayload: Record<string, unknown> = {};
    if (sanitizedUpdates.target_sale_price !== undefined) {
      syncPayload.target_sale_price = sanitizedUpdates.target_sale_price;
    }
    if (sanitizedUpdates.cost_price !== undefined) {
      syncPayload.cost_price = sanitizedUpdates.cost_price;
    }
    if (sanitizedUpdates.season !== undefined) {
      syncPayload.season = sanitizedUpdates.season;
    }
    if (sanitizedUpdates.image_url !== undefined) {
      syncPayload.image_url = sanitizedUpdates.image_url;
    }

    await supabase
      .from("perfumes")
      .update(syncPayload)
      .eq("brand", perfume.brand)
      .eq("scent_name", perfume.scent_name);
  }

  await logger.info("perfume_updated", { perfumeId: id, adminId: user.id });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/catalog");
}

export async function updatePerfumePhoto(id: string, image: File) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  await requireAdmin(supabase, user.id);

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

  await logger.info("perfume_photo_updated", { perfumeId: id, adminId: user.id });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deletePerfume(id: string, imageUrl?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  await requireAdmin(supabase, user.id);

  if (imageUrl) {
    const path = imageUrl.split("/perfume_images/")[1];
    if (path) await supabase.storage.from("perfume_images").remove([path]);
  }

  const { error } = await supabase.from("perfumes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logger.info("perfume_deleted", { perfumeId: id, adminId: user.id });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function setFlashSale(id: string, flashSalePrice: number | null, flashSaleEnd: string | null, flashSaleStock?: number | null, flashSaleName?: string | null) {
  const parsed = flashSaleSchema.safeParse({
    id,
    flashSalePrice,
    flashSaleEnd,
    flashSaleStock,
    flashSaleName,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid flash sale parameters");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  
  // Verify user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized: Admins only");

  const { data: perfume } = await supabase.from("perfumes").select("brand, scent_name").eq("id", parsed.data.id).single();
  if (!perfume) throw new Error("Perfume not found");

  const { error } = await supabase
    .from("perfumes")
    .update({ 
      flash_sale_price: parsed.data.flashSalePrice, 
      flash_sale_end: parsed.data.flashSaleEnd,
      flash_sale_stock: parsed.data.flashSaleStock ?? null,
      flash_sale_name: parsed.data.flashSaleName ?? null
    })
    .eq("brand", perfume.brand)
    .eq("scent_name", perfume.scent_name);

  if (error) throw new Error(error.message);
  
  await logger.info("flash_sale_set", { perfumeId: id, price: parsed.data.flashSalePrice });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function setBulkFlashSale(ids: string[], discountPercent: number, flashSaleEnd: string | null, flashSaleName?: string | null) {
  const parsed = bulkFlashSaleSchema.safeParse({
    ids,
    discountPercent,
    flashSaleEnd,
    flashSaleName,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid bulk flash sale parameters");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized: Admins only");

  // Fetch target perfumes to get their brands and scents
  const { data: perfumes } = await supabase.from("perfumes").select("brand, scent_name, target_sale_price").in("id", parsed.data.ids);
  if (!perfumes || perfumes.length === 0) return;

  // We want to apply the discount to ALL rows that match the selected brands + scent names
  for (const perfume of perfumes) {
    const discountedPrice = Math.floor(perfume.target_sale_price * (1 - parsed.data.discountPercent / 100));
    
    await supabase.from("perfumes").update({
      flash_sale_price: discountedPrice,
      flash_sale_end: parsed.data.flashSaleEnd,
      flash_sale_stock: null, // Bulk doesn't set specific stock limits
      flash_sale_name: parsed.data.flashSaleName ?? null
    })
    .eq("brand", perfume.brand)
    .eq("scent_name", perfume.scent_name);
  }

  await logger.info("bulk_flash_sale_set", { count: perfumes.length, discountPercent: parsed.data.discountPercent });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export async function recordSale(formData: FormData) {
  const rawInput = {
    perfume_id: formData.get("perfume_id"),
    quantity_sold: formData.get("quantity_sold"),
    unit_price: formData.get("unit_price"),
    customer_name: formData.get("customer_name") || null,
    notes: formData.get("notes") || null,
  };

  const parsed = recordSaleSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid sale details");
  }

  const { perfume_id, quantity_sold, unit_price, customer_name, notes } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  await requireAdmin(supabase, user.id);

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

  await logger.info("sale_recorded", { perfume_id, quantity_sold, unit_price, adminId: user.id });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function getSales(): Promise<Sale[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  await requireAdmin(supabase, user.id);

  // Filter sales by the admin who recorded them
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
    .eq("user_id", user.id)
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
      image_url:
        (perfume?.image_url as string | null) ||
        (perfume && getAvifUrl(perfume as unknown as Perfume) !== "/logo.svg"
          ? getAvifUrl(perfume as unknown as Perfume)
          : null),
    };
  });
}

export async function deleteSale(saleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  await requireAdmin(supabase, user.id);

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