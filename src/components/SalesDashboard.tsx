"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Minus } from "lucide-react";
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

  const filteredSales = selectedMonth
    ? monthlyGroups.find((g) => g.month === selectedMonth)?.sales ?? sales
    : sales;

  return (
    <div className="space-y-6">
      {/* Monthly breakdown + Top sellers */}
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
                  onClick={() =>
                    setSelectedMonth(
                      selectedMonth === group.month ? null : group.month
                    )
                  }
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

      {/* Sales history header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg text-foreground sm:text-xl">
          {selectedMonth
            ? `Sales — ${
                monthlyGroups.find((g) => g.month === selectedMonth)?.label ??
                ""
              }`
            : "All Sales"}
        </h2>
        {selectedMonth && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedMonth(null)}
            className="text-xs text-muted-foreground"
          >
            <Minus className="mr-1.5 h-3.5 w-3.5" />
            Clear Filter
          </Button>
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
