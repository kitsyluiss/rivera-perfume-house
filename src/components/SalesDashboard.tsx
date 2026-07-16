"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, Minus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sale } from "@/lib/types";
import { Perfume } from "@/lib/types";
import SalesHistory from "@/components/SalesHistory";
import { formatPhp } from "@/lib/format";
import { toast } from "sonner";
import { getSales } from "@/lib/actions";

interface MonthlyGroup {
  month: string;
  label: string;
  sales: Sale[];
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  unitsSold: number;
}

// ─── CSV export ────────────────────────────────────────────────────────────────

function exportSalesToCSV(sales: Sale[], filename = "sales-export.csv") {
  const header = [
    "Date",
    "Brand",
    "Scent",
    "Qty Sold",
    "Unit Price",
    "Total Revenue",
    "Cost",
    "Profit",
    "Customer",
    "Notes",
  ];

  const rows = sales.map((s) => {
    const total = s.quantity_sold * s.unit_price;
    const profit = s.quantity_sold * (s.unit_price - s.cost_at_sale);
    return [
      new Date(s.created_at).toLocaleDateString("en-PH"),
      s.brand ?? "",
      s.scent_name ?? "",
      s.quantity_sold,
      s.unit_price.toFixed(2),
      total.toFixed(2),
      (s.quantity_sold * s.cost_at_sale).toFixed(2),
      profit.toFixed(2),
      s.customer_name ?? "",
      s.notes ?? "",
    ];
  });

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Analytics Bar Chart (pure CSS) ──────────────────────────────────────────

function AnalyticsChart({ groups }: { groups: MonthlyGroup[] }) {
  const maxRevenue = Math.max(...groups.map((g) => g.totalRevenue), 1);

  return (
    <div className="space-y-3">
      <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
        <TrendingUp className="h-3.5 w-3.5" />
        Revenue &amp; Profit
      </h3>
      <div className="space-y-2">
        {groups.slice(0, 6).map((g) => {
          const revPct = (g.totalRevenue / maxRevenue) * 100;
          const profPct = Math.max(0, (g.totalProfit / maxRevenue) * 100);
          return (
            <div key={g.month} className="group">
              <div className="mb-0.5 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{g.label}</span>
                <span className="text-[10px] text-emerald-400">{formatPhp(g.totalProfit)}</span>
              </div>
              <div className="relative h-5 overflow-hidden rounded-full bg-secondary">
                {/* Revenue bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary/25 transition-all duration-700"
                  style={{ width: `${revPct}%` }}
                />
                {/* Profit bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-emerald-500/50 transition-all duration-700"
                  style={{ width: `${profPct}%` }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/70">
                  {formatPhp(g.totalRevenue)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary/40" />Revenue</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500/50" />Profit</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SalesDashboard({
  perfumes,
  sales,
  loading,
  onUpdate,
}: {
  perfumes: Perfume[];
  sales: Sale[];
  loading: boolean;
  onUpdate: () => void;
}) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Monthly grouping
  const monthlyGroups = useMemo((): MonthlyGroup[] => {
    const groups = new Map<string, Sale[]>();

    for (const sale of sales) {
      const date = new Date(sale.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = groups.get(key) ?? [];
      existing.push(sale);
      groups.set(key, existing);
    }

    return [...groups.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, monthSales]) => {
        const [year, m] = month.split("-");
        const date = new Date(Number(year), Number(m) - 1);
        const revenue = monthSales.reduce(
          (sum, s) => sum + s.quantity_sold * s.unit_price,
          0
        );
        const cost = monthSales.reduce(
          (sum, s) => sum + s.quantity_sold * s.cost_at_sale,
          0
        );

        return {
          month,
          label: date.toLocaleDateString("en-PH", {
            month: "long",
            year: "numeric",
          }),
          sales: monthSales,
          totalRevenue: revenue,
          totalCost: cost,
          totalProfit: revenue - cost,
          unitsSold: monthSales.reduce((sum, s) => sum + s.quantity_sold, 0),
        };
      });
  }, [sales]);

  // Top sellers
  const topSellers = useMemo(() => {
    const byProduct = new Map<
      string,
      { brand: string; scent: string; units: number; revenue: number }
    >();

    for (const sale of sales) {
      const key = sale.perfume_id;
      const existing = byProduct.get(key) ?? {
        brand: sale.brand ?? "Unknown",
        scent: sale.scent_name ?? "—",
        units: 0,
        revenue: 0,
      };
      existing.units += sale.quantity_sold;
      existing.revenue += sale.quantity_sold * sale.unit_price;
      byProduct.set(key, existing);
    }

    return [...byProduct.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  // Active filter: date range overrides month selection
  const filteredSales = useMemo(() => {
    if (dateFrom || dateTo) {
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo + "T23:59:59") : null;
      return sales.filter((s) => {
        const d = new Date(s.created_at);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }
    if (selectedMonth) {
      return monthlyGroups.find((g) => g.month === selectedMonth)?.sales ?? sales;
    }
    return sales;
  }, [sales, selectedMonth, dateFrom, dateTo, monthlyGroups]);

  const clearFilters = useCallback(() => {
    setSelectedMonth(null);
    setDateFrom("");
    setDateTo("");
  }, []);

  const hasFilter = selectedMonth || dateFrom || dateTo;

  const handleExportCSV = () => {
    if (filteredSales.length === 0) {
      toast.error("No sales to export");
      return;
    }
    const suffix = dateFrom || dateTo
      ? `${dateFrom || "all"}_to_${dateTo || "all"}`
      : selectedMonth ?? "all";
    exportSalesToCSV(filteredSales, `rivera-sales-${suffix}.csv`);
    toast.success(`Exported ${filteredSales.length} sale${filteredSales.length !== 1 ? "s" : ""} to CSV`);
  };

  return (
    <div className="space-y-6">

      {/* ── Analytics chart ──────────────────────────────────────────── */}
      {monthlyGroups.length > 0 && (
        <AnalyticsChart groups={monthlyGroups} />
      )}

      {/* ── Monthly breakdown + Top sellers ─────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Monthly breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground">
            Monthly Breakdown
          </h3>
          {monthlyGroups.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No sales data yet.
            </p>
          ) : (
            <div className="space-y-2">
              {monthlyGroups.map((group) => (
                <button
                  key={group.month}
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setSelectedMonth(
                      selectedMonth === group.month ? null : group.month
                    );
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedMonth === group.month
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {group.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {group.sales.length} sale
                      {group.sales.length !== 1 ? "s" : ""} ·{" "}
                      {group.unitsSold} units
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                      Revenue: {formatPhp(group.totalRevenue)}
                    </span>
                    <span
                      className={
                        group.totalProfit >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      Profit: {formatPhp(group.totalProfit)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Top sellers */}
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground">
            Top Sellers
          </h3>
          {topSellers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No data yet.
            </p>
          ) : (
            <div className="space-y-2">
              {topSellers.map((item, index) => (
                <div
                  key={`${item.brand}-${item.scent}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.brand}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.scent}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">
                      {item.units} sold
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPhp(item.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* ── Sales history header + filters ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg text-foreground sm:text-xl">
          {selectedMonth
            ? `Sales — ${
                monthlyGroups.find((g) => g.month === selectedMonth)?.label ??
                ""
              }`
            : dateFrom || dateTo
            ? "Sales — Custom Range"
            : "All Sales"}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {hasFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground"
            >
              <Minus className="mr-1.5 h-3.5 w-3.5" />
              Clear Filter
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs border-border text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ── Date range filter ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mr-1">
          Date Range
        </span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setSelectedMonth(null);
          }}
          className="h-7 rounded border border-border bg-secondary px-2 text-xs text-foreground outline-none focus:border-primary/40 transition-colors"
          placeholder="From"
        />
        <span className="text-muted-foreground text-xs">→</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setSelectedMonth(null);
          }}
          className="h-7 rounded border border-border bg-secondary px-2 text-xs text-foreground outline-none focus:border-primary/40 transition-colors"
          placeholder="To"
        />
        {(dateFrom || dateTo) && (
          <span className="text-[10px] text-muted-foreground ml-1">
            {filteredSales.length} result{filteredSales.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <SalesHistory
        sales={filteredSales}
        loading={loading}
        onUpdate={onUpdate}
      />
    </div>
  );
}
