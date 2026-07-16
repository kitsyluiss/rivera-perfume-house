"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sale } from "@/lib/types";
import { deleteSale } from "@/lib/actions";
import { formatPhp } from "@/lib/format";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function SalesHistory({
  sales,
  loading,
  onUpdate,
}: {
  sales: Sale[];
  loading: boolean;
  onUpdate: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmReversal, setConfirmReversal] = useState<Sale | null>(null);

  const executeDelete = async (sale: Sale) => {
    setDeletingId(sale.id);
    try {
      await deleteSale(sale.id);
      toast.success("Sale reversed, inventory restored");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reverse sale");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        No sales recorded yet. Use the &ldquo;Sell&rdquo; button to record your first sale.
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile card list ─────────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {sales.map((sale) => {
          const total = sale.quantity_sold * sale.unit_price;
          const profit = sale.quantity_sold * (sale.unit_price - sale.cost_at_sale);
          const date = new Date(sale.created_at);

          return (
            <div
              key={sale.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              {/* Top row */}
              <div className="flex items-start gap-3">
                {sale.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sale.image_url}
                    alt={sale.scent_name ?? ""}
                    className="h-11 w-11 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 shrink-0 rounded-lg bg-secondary" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{sale.brand ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{sale.scent_name ?? "—"}</p>
                  {sale.customer_name && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{sale.customer_name}</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-[10px] text-muted-foreground">
                    {date.toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-red-400"
                    onClick={() => setConfirmReversal(sale)}
                    disabled={deletingId === sale.id}
                    title="Reverse sale"
                  >
                    {deletingId === sale.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Qty</p>
                  <p className="mt-0.5 text-sm text-foreground">{sale.quantity_sold.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Total</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{formatPhp(total)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Profit</p>
                  <p className={`mt-0.5 text-sm font-medium ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatPhp(profit)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table ─────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-[1.1rem] border border-border md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Product</TableHead>
                <TableHead className="text-right text-muted-foreground">Qty</TableHead>
                <TableHead className="text-right text-muted-foreground">Unit Price</TableHead>
                <TableHead className="text-right text-muted-foreground">Total</TableHead>
                <TableHead className="text-right text-muted-foreground">Profit</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="w-12 text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => {
                const total = sale.quantity_sold * sale.unit_price;
                const profit =
                  sale.quantity_sold * (sale.unit_price - sale.cost_at_sale);
                const date = new Date(sale.created_at);

                return (
                  <TableRow key={sale.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {sale.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={sale.image_url}
                            alt={sale.scent_name ?? ""}
                            className="h-9 w-9 rounded object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded bg-secondary" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {sale.brand ?? "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sale.scent_name ?? "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.quantity_sold.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPhp(sale.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPhp(total)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        profit >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatPhp(profit)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {sale.customer_name ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {date.toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        onClick={() => setConfirmReversal(sale)}
                        disabled={deletingId === sale.id}
                        title="Reverse sale"
                      >
                        {deletingId === sale.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmReversal}
        onOpenChange={(open) => {
          if (!open) setConfirmReversal(null);
        }}
        title="Reverse Sale"
        description={
          confirmReversal
            ? `Reverse sale of ${confirmReversal.brand ?? "Unknown"} — ${confirmReversal.scent_name ?? ""}? Inventory will be restored.`
            : ""
        }
        confirmLabel="Reverse"
        variant="destructive"
        onConfirm={() => {
          if (confirmReversal) void executeDelete(confirmReversal);
        }}
      />
    </>
  );
}
