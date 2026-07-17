-- E-Commerce Schema Update (Manual Payments)
-- Run this in your Supabase SQL Editor

-- Customer shipping addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shopping cart (persistent)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  perfume_id UUID REFERENCES perfumes(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, perfume_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN ('pending_verification','paid','processing','shipped','delivered','cancelled')),
  subtotal INTEGER NOT NULL,          -- in centavos
  shipping_fee INTEGER DEFAULT 0,
  total INTEGER NOT NULL,             -- in centavos
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order line items (snapshot of prices at time of purchase)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  perfume_id UUID REFERENCES perfumes(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,        -- in centavos, frozen at purchase
  cost_price INTEGER NOT NULL,        -- in centavos, for profit tracking
  brand TEXT NOT NULL,
  scent_name TEXT NOT NULL,
  image_url TEXT
);

-- Enable RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Add role to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));

-- Update existing profiles (admins) to have admin role
UPDATE profiles SET role = 'admin' WHERE role IS NULL OR role = 'customer';

-- Policies for Profiles (Admins can see all, Customers see own)
DROP POLICY IF EXISTS "View own profile" ON profiles;
CREATE POLICY "View own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Addresses Policies
DROP POLICY IF EXISTS "Manage own addresses" ON addresses;
CREATE POLICY "Manage own addresses" ON addresses FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Cart Policies
DROP POLICY IF EXISTS "Manage own cart" ON cart_items;
CREATE POLICY "Manage own cart" ON cart_items FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Orders Policies
DROP POLICY IF EXISTS "View own orders" ON orders;
CREATE POLICY "View own orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Insert own orders" ON orders;
CREATE POLICY "Insert own orders" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all orders" ON orders;
CREATE POLICY "Admins manage all orders" ON orders FOR ALL TO authenticated USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Order Items Policies
DROP POLICY IF EXISTS "View own order items" ON order_items;
CREATE POLICY "View own order items" ON order_items FOR SELECT TO authenticated USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Insert own order items" ON order_items;
CREATE POLICY "Insert own order items" ON order_items FOR INSERT TO authenticated WITH CHECK (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins manage all order items" ON order_items;
CREATE POLICY "Admins manage all order items" ON order_items FOR ALL TO authenticated USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==============================================================================
-- SECURITY PATCH (Auth Separation)
-- ==============================================================================

-- 1. Fix role assignment (the original migration incorrectly set ALL users to admin)
-- Reset all to customer first:
UPDATE profiles SET role = 'customer';

-- IMPORTANT: You must now go to your Supabase Dashboard -> Table Editor -> profiles
-- Find your own account and manually change the role column to 'admin'.
-- This prevents any new signups from automatically becoming admins.

-- 2. Restrict profiles visibility so customers cannot read admin profiles
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
-- Create a secure function to check admin status without infinite recursion
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING (
  is_admin()
);

-- 3. Fix Orders to Profiles relationship for PostgREST
-- This allows Supabase to join orders directly with profiles to fetch the customer name
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- ==============================================================================
-- RECEIPT UPLOADS FEATURE
-- ==============================================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for receipts
DROP POLICY IF EXISTS "Public receipts view" ON storage.objects;
CREATE POLICY "Public receipts view" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Admins can upload receipts" ON storage.objects;
CREATE POLICY "Admins can upload receipts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'receipts' AND 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can manage receipts" ON storage.objects;
CREATE POLICY "Admins can manage receipts" ON storage.objects FOR ALL TO authenticated USING (
  bucket_id = 'receipts' AND 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==============================================================================
-- PAYMENT METHODS FEATURE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view active payment methods" ON payment_methods;

-- ==============================================================================
-- FLASH SALES FEATURE
-- ==============================================================================

-- Add flash sale columns to existing perfumes table
ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS flash_sale_price INTEGER CHECK (flash_sale_price >= 0);
ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS flash_sale_end TIMESTAMPTZ;
CREATE POLICY "Anyone can view active payment methods" ON payment_methods FOR SELECT USING (is_active = true OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins manage payment methods" ON payment_methods;
CREATE POLICY "Admins manage payment methods" ON payment_methods FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Note: You can create the bucket and policies by running this script, no need to do it manually!
INSERT INTO storage.buckets (id, name, public) VALUES ('payment_qrs', 'payment_qrs', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public QR code view" ON storage.objects;
CREATE POLICY "Public QR code view" ON storage.objects FOR SELECT USING (bucket_id = 'payment_qrs');

DROP POLICY IF EXISTS "Admins can upload QR codes" ON storage.objects;
CREATE POLICY "Admins can upload QR codes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'payment_qrs' AND 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can manage QR codes" ON storage.objects;
CREATE POLICY "Admins can manage QR codes" ON storage.objects FOR ALL TO authenticated USING (
  bucket_id = 'payment_qrs' AND 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
