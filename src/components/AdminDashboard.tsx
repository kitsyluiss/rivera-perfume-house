"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPerfumes, getSales, signOut } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { Perfume, Sale } from "@/lib/types";
import InventoryTable from "@/components/InventoryTable";
import SalesDashboard from "@/components/SalesDashboard";
import OrdersTable from "@/components/OrdersTable";
import PaymentMethodsTable from "@/components/PaymentMethodsTable";
import AnimatedNumber from "@/components/AnimatedNumber";
import { formatPhp } from "@/lib/format";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PreloaderIdent from "@/components/PreloaderIdent";
import { getAdminOrders } from "@/lib/admin-actions";
import { Order } from "@/lib/types";

const AddPerfumeForm = dynamic(() => import("@/components/AddPerfumeForm"), {
  ssr: false,
});
const SellDialog = dynamic(() => import("@/components/SellDialog"), {
  ssr: false,
});
import { LogOut } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;
const php = (n: number) => formatPhp(n);

type Tab = "inventory" | "sales" | "orders" | "payments";

function StatsGrid({
  stats,
}: {
  stats: { label: string; value: number; icon: React.ElementType; format?: (n: number) => string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 w-full">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="w-full block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 + index * 0.07, ease }}
        >
          <Card className="group relative overflow-hidden border-border bg-card w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10 p-6 sm:p-7">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="font-body text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {stat.label}
                </span>
                <stat.icon className="h-4 w-4 text-primary/60" />
              </div>
              <p className="font-display text-xl text-foreground tabular-nums sm:text-2xl">
                <AnimatedNumber value={stat.value} format={stat.format} />
              </p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingPerfumes, setLoadingPerfumes] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("inventory");
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const router = useRouter();

  const fetchPerfumes = useCallback(async () => {
    try {
      const data = await getPerfumes();
      setPerfumes(data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load inventory");
    } finally {
      setLoadingPerfumes(false);
    }
  }, []);

  const fetchSales = useCallback(async () => {
    try {
      const data = await getSales();
      setSales(data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load sales history");
    } finally {
      setLoadingSales(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getAdminOrders();
      setOrders(data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    void fetchPerfumes();
    void fetchSales();
    void fetchOrders();
  }, [fetchPerfumes, fetchSales, fetchOrders]);

  // ── Supabase Realtime — auto-refresh on remote changes ────────────
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "perfumes" },
        () => void fetchPerfumes()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales" },
        () => void fetchSales()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => void fetchOrders()
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [fetchPerfumes, fetchSales, fetchOrders]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    router.refresh();
  };

  // ── Inventory stats ──────────────────────────────────
  const groupedStock = perfumes.reduce((acc, p) => {
    const key = `${p.brand.toLowerCase()}||${p.scent_name.toLowerCase()}`;
    if (!acc[key]) {
      acc[key] = { brand: p.brand, scent_name: p.scent_name, totalQuantity: 0 };
    }
    acc[key].totalQuantity += p.quantity;
    return acc;
  }, {} as Record<string, { brand: string; scent_name: string; totalQuantity: number }>);
  
  const lowStockItems = Object.values(groupedStock).filter((item) => item.totalQuantity < 5);
  const totalSKUs = perfumes.length;
  const totalUnits = perfumes.reduce((sum, p) => sum + p.quantity, 0);
  const inventoryCost = perfumes.reduce(
    (sum, p) => sum + p.quantity * p.cost_price,
    0
  );
  const projectedRevenue = perfumes.reduce(
    (sum, p) => sum + p.quantity * p.target_sale_price,
    0
  );
  const projectedProfit = projectedRevenue - inventoryCost;

  const inventoryStats = [
    { label: "Total SKUs", value: totalSKUs, icon: Package },
    { label: "Total Units", value: totalUnits, icon: BarChart3 },
    { label: "Inventory Cost", value: inventoryCost, icon: DollarSign, format: php },
    { label: "Projected Profit", value: projectedProfit, icon: TrendingUp, format: php },
  ];

  // ── Sales stats ──────────────────────────────────────
  const totalSalesRevenue = sales.reduce(
    (sum, s) => sum + s.quantity_sold * s.unit_price,
    0
  );
  const totalSalesCost = sales.reduce(
    (sum, s) => sum + s.quantity_sold * s.cost_at_sale,
    0
  );
  const totalSalesProfit = totalSalesRevenue - totalSalesCost;
  const totalUnitsSold = sales.reduce((sum, s) => sum + s.quantity_sold, 0);

  const salesStats = [
    { label: "Total Sales", value: sales.length, icon: ShoppingCart },
    { label: "Units Sold", value: totalUnitsSold, icon: BarChart3 },
    { label: "Revenue", value: totalSalesRevenue, icon: DollarSign, format: php },
    { label: "Profit", value: totalSalesProfit, icon: TrendingUp, format: php },
  ];

  const pendingOrders = orders.filter((o) => o.status === "pending_verification");
  
  const orderStats = [
    { label: "Total Orders", value: orders.length, icon: ClipboardList },
    { label: "Pending", value: pendingOrders.length, icon: AlertTriangle },
    { label: "Revenue", value: orders.reduce((sum, o) => o.status === "paid" || o.status === "shipped" || o.status === "delivered" ? sum + o.total : sum, 0), icon: DollarSign, format: php },
    { label: "Unfulfilled", value: orders.filter((o) => o.status === "paid").length, icon: Package },
  ];

  const currentStats = tab === "inventory" ? inventoryStats : tab === "sales" ? salesStats : orderStats;

  return (
    <>
      {!preloaderDone && (
        <PreloaderIdent onComplete={() => setPreloaderDone(true)} />
      )}

      <div
        className="min-h-screen transition-opacity duration-500"
        style={{ opacity: preloaderDone ? 1 : 0 }}
      >
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6"
      >
        <h1 className="text-base tracking-wide text-foreground sm:text-xl lg:text-2xl">
          Inventory <span className="text-primary">Dashboard</span>
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
          <span className="sm:hidden">Out</span>
        </Button>
      </motion.header>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-5 sm:py-6 lg:px-6 lg:py-7">

        {/* Stats row — swaps between inventory and sales */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="w-full block pt-3 sm:pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease }}
          >
            <StatsGrid stats={currentStats} />
          </motion.div>
        </AnimatePresence>

        <Separator className="bg-border" />

        {/* ── Low-stock banner ─────────────────────────────────────── */}
        <AnimatePresence>
          {lowStockItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-300">
                  {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""} running low
                </p>
                <p className="mt-0.5 text-[11px] text-amber-400/70 truncate">
                  {lowStockItems.map((p) => `${p.brand} — ${p.scent_name}`).join(" · ")}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex items-center justify-between gap-1 rounded-xl sm:rounded-full border border-border bg-card/60 p-1 backdrop-blur-md w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setTab("inventory")}
              className={`flex flex-1 justify-center items-center gap-1.5 rounded-lg sm:rounded-full px-2 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors sm:gap-2 sm:px-4 sm:text-xs ${
                tab === "inventory"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Package className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">Inventory</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("sales")}
              className={`flex flex-1 justify-center items-center gap-1.5 rounded-lg sm:rounded-full px-2 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors sm:gap-2 sm:px-4 sm:text-xs ${
                tab === "sales"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">Sales</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("orders")}
              className={`flex flex-1 justify-center items-center gap-1.5 rounded-lg sm:rounded-full px-2 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors sm:gap-2 sm:px-4 sm:text-xs ${
                tab === "orders"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">Orders</span>
              {pendingOrders.length > 0 && (
                <span className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {pendingOrders.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab("payments")}
              className={`flex flex-1 justify-center items-center gap-1.5 rounded-lg sm:rounded-full px-2 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors sm:gap-2 sm:px-4 sm:text-xs ${
                tab === "payments"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">Payments</span>
            </button>
          </div>

          <motion.div 
            className="w-full sm:w-auto"
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }}
          >
            {tab === "inventory" ? (
              <Button
                onClick={() => setAddOpen(true)}
                className="w-full h-9 px-3 text-[10px] uppercase tracking-wider sm:h-10 sm:px-4 sm:text-xs sm:w-auto"
              >
                <Plus className="mr-1.5 h-4 w-4 sm:mr-2" />
                Add New
              </Button>
            ) : (
              <Button
                onClick={() => setSellOpen(true)}
                className="w-full h-9 px-3 text-[10px] uppercase tracking-wider sm:h-10 sm:px-4 sm:text-xs sm:w-auto"
              >
                <Plus className="mr-1.5 h-4 w-4 sm:mr-2" />
                Sell
              </Button>
            )}
          </motion.div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === "inventory" ? (
            <motion.div
              key="inventory"
              className="w-full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease }}
              id="inventory-list"
            >
              <InventoryTable
                perfumes={[...perfumes].sort((a, b) => {
                  if (a.quantity === 0 && b.quantity > 0) return 1;
                  if (a.quantity > 0 && b.quantity === 0) return -1;
                  return 0;
                })}
                loading={loadingPerfumes}
                onUpdate={fetchPerfumes}
                onSell={(perfume) => {
                  setSelectedPerfume(perfume);
                  setSellOpen(true);
                }}
              />
            </motion.div>
          ) : tab === "sales" ? (
            <motion.div
              key="sales"
              className="w-full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease }}
            >
              <SalesDashboard
                perfumes={perfumes}
                sales={sales}
                loading={loadingSales}
                onUpdate={fetchSales}
              />
            </motion.div>
          ) : tab === "orders" ? (
            <motion.div
              key="orders"
              className="w-full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease }}
            >
              <OrdersTable
                orders={orders}
                loading={loadingOrders}
                onUpdate={() => { fetchOrders(); fetchPerfumes(); fetchSales(); }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="payments"
              className="w-full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease }}
            >
              <PaymentMethodsTable />
            </motion.div>
          )}
        </AnimatePresence>

        <AddPerfumeForm
          open={addOpen}
          onOpenChange={setAddOpen}
          existingPerfumes={perfumes}
          onSuccess={() => {
            fetchPerfumes();
            setAddOpen(false);
          }}
        />

        <SellDialog
          open={sellOpen}
          onOpenChange={(open) => {
            setSellOpen(open);
            if (!open) setSelectedPerfume(null);
          }}
          perfumes={perfumes}
          preselectedPerfume={selectedPerfume}
          onSuccess={() => {
            fetchPerfumes();
            fetchSales();
            setSellOpen(false);
            setSelectedPerfume(null);
          }}
        />
      </div>
    </div>
    </>
  );
}