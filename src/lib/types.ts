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
}

export interface Profile {
  id: string;
  display_name: string;
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