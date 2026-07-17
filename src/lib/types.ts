import type { PerfumeTag } from "@/lib/perfume-tags";

export interface Perfume {
  id: string;
  brand: string;
  scent_name: string;
  season?: PerfumeTag | null;
  quantity: number;
  cost_price: number;
  target_sale_price: number;
  image_url: string | null;
  created_at: string;
  user_id?: string | null;
  added_by?: string | null; // display_name from profiles join
  flash_sale_price?: number | null;
  flash_sale_end?: string | null;
  flash_sale_stock?: number | null;
  flash_sale_name?: string | null;
}

export interface Profile {
  id: string;
  display_name: string;
  role?: 'admin' | 'customer';
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  perfume_id: string;
  quantity: number;
  created_at: string;
  // Joined fields
  perfume?: Perfume;
}

export interface OrderItem {
  id: string;
  order_id: string;
  perfume_id: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  brand: string;
  scent_name: string;
  image_url: string | null;
}

export type OrderStatus = 'pending_verification' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  address_id: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  notes: string | null;
  receipt_url?: string | null;
  created_at: string;
  
  // Joined fields
  address?: Address | null;
  items?: OrderItem[];
  customer_name?: string; // from profiles join
}

export interface Sale {
  id: string;
  perfume_id: string;
  quantity_sold: number;
  unit_price: number;
  cost_at_sale: number;
  customer_name: string | null;
  notes: string | null;
  created_at: string;
  // Joined fields
  brand?: string;
  scent_name?: string;
  image_url?: string | null;
}

export interface MonthlySalesSummary {
  month: string; // "YYYY-MM"
  totalSales: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  unitsSold: number;
}