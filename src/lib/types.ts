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
  invoice_number?: string | null;
  
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
  invoice_number?: string | null;
  net_price?: number; // VAT-exclusive amount (PHP)
  vat_amount?: number; // 12% output VAT (PHP)
  is_reversed?: boolean;
  reversal_of_id?: string | null;
  reversal_reason?: string | null;
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

export interface AccountingPeriod {
  id: string;
  name: string; // e.g. "2026-10" or "FY2026-P10"
  start_date: string;
  end_date: string;
  is_closed: boolean;
  closed_at: string | null;
  closed_by: string | null;
  opening_inventory_cents: number;
  closing_inventory_cents: number;
  total_revenue_cents: number;
  total_cogs_cents: number;
  total_vat_cents: number;
  net_income_cents: number;
}

export interface AuditAnomaly {
  id: string;
  severity: "CRITICAL" | "WARNING" | "NOTICE";
  category: "MARGIN_VIOLATION" | "UNVERIFIED_RECEIVABLE" | "INVENTORY_STOCKOUT" | "SHRINKAGE_RISK";
  title: string;
  description: string;
  discrepancy_amount?: number;
  affected_item?: string;
}

export interface BIRReceiptData {
  businessName: string;
  tagline: string;
  address: string;
  invoiceNumber: string; // Global sequence (e.g. RFH-INV-00001)
  orderId?: string;
  transactionDate: string;
  cashierName: string;
  customerName: string;
  customerAddress?: string;
  items: Array<{
    brand: string;
    scent_name: string;
    quantity: number;
    unit_price: number;
    gross_amount: number;
    net_amount: number;
    vat_amount: number;
  }>;
  grossTotal: number;
  vatableSales: number;
  vatAmount: number; // 12%
  vatExemptSales: number;
  zeroRatedSales: number;
  shippingFee: number;
  amountDue: number;
  paymentMethod: string;
  paymentReference?: string;
  isDisclaimerNotice: string;
}