import { z } from "zod";

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  redirectUrl: z.string().url("Invalid redirect URL").optional(),
});

export const passwordResetSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  redirectUrl: z.string().url("Invalid redirect URL"),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ─── Perfume & Catalog Schemas ────────────────────────────────────────────────

export const addPerfumeSchema = z.object({
  brand: z.string().trim().min(1, "Brand is required").max(100),
  scent_name: z.string().trim().min(1, "Scent name is required").max(150),
  season: z.string().trim().max(50).nullable().optional(),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  cost_price: z.coerce.number().min(0, "Cost price cannot be negative"),
  target_sale_price: z.coerce.number().min(0, "Target sale price cannot be negative"),
});

export const updatePerfumeSchema = z.object({
  brand: z.string().trim().min(1).max(100).optional(),
  scent_name: z.string().trim().min(1).max(150).optional(),
  season: z.string().trim().max(50).nullable().optional(),
  quantity: z.coerce.number().int().min(0).optional(),
  cost_price: z.coerce.number().min(0).optional(),
  target_sale_price: z.coerce.number().min(0).optional(),
  image_url: z.string().url().nullable().optional(),
});

export const flashSaleSchema = z.object({
  id: z.string().uuid("Invalid perfume ID"),
  flashSalePrice: z.coerce.number().int().min(0).nullable().optional(),
  flashSaleEnd: z.string().nullable().optional(),
  flashSaleStock: z.coerce.number().int().min(0).nullable().optional(),
  flashSaleName: z.string().trim().max(100).nullable().optional(),
});

export const bulkFlashSaleSchema = z.object({
  ids: z.array(z.string().uuid("Invalid perfume ID")).min(1, "Select at least one perfume"),
  discountPercent: z.coerce.number().min(1, "Discount must be at least 1%").max(99, "Discount cannot exceed 99%"),
  flashSaleEnd: z.string().nullable().optional(),
  flashSaleName: z.string().trim().max(100).nullable().optional(),
});

// ─── Sales Schemas ────────────────────────────────────────────────────────────

export const recordSaleSchema = z.object({
  perfume_id: z.string().uuid("Invalid perfume ID"),
  quantity_sold: z.coerce.number().int().min(1, "Quantity sold must be at least 1"),
  unit_price: z.coerce.number().min(0, "Unit price cannot be negative"),
  customer_name: z.string().trim().max(150).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

// ─── E-Commerce & Checkout Schemas ────────────────────────────────────────────

export const addressSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(100),
  phone: z.string().trim().min(7, "Valid phone number required").max(20),
  line1: z.string().trim().min(3, "Address line 1 is required").max(200),
  line2: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().min(1, "City is required").max(100),
  province: z.string().trim().min(1, "Province is required").max(100),
  postal_code: z.string().trim().min(2, "Postal code is required").max(20),
  is_default: z.boolean().default(false),
});

export const addToCartSchema = z.object({
  perfumeId: z.string().uuid("Invalid perfume ID"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
});

export const paymentMethodSchema = z.object({
  provider_name: z.string().trim().min(1, "Provider name is required").max(50),
  account_name: z.string().trim().min(1, "Account name is required").max(100),
  account_number: z.string().trim().min(1, "Account number is required").max(100),
  qr_code_url: z.string().url().nullable().optional(),
});
