"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Perfume } from "@/lib/types";
import { recordSale } from "@/lib/actions";
import { formatPhp } from "@/lib/format";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfumes: Perfume[];
  onSuccess: () => void;
  preselectedPerfume?: Perfume | null;
}

export default function SellDialog({
  open,
  onOpenChange,
  perfumes,
  onSuccess,
  preselectedPerfume,
}: Props) {
  const [perfumeId, setPerfumeId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const quantityRef = useRef<HTMLInputElement>(null);

  // Auto-focus quantity when perfume is already chosen
  useEffect(() => {
    if (open && preselectedPerfume) {
      const t = setTimeout(() => quantityRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [open, preselectedPerfume]);

  const selectedPerfume =
    preselectedPerfume ?? perfumes.find((p) => p.id === perfumeId) ?? null;

  const reset = () => {
    setPerfumeId("");
    setQuantity("1");
    setUnitPrice("");
    setCustomerName("");
    setNotes("");
  };

  const handlePerfumeChange = (id: string) => {
    setPerfumeId(id);
    const perfume = perfumes.find((p) => p.id === id);
    if (perfume) {
      setUnitPrice(String(perfume.target_sale_price));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const qty = Number(quantity);
    const price = Number(unitPrice);

    if (!selectedPerfume) {
      toast.error("Select a perfume");
      return;
    }
    if (!qty || qty < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (qty > selectedPerfume.quantity) {
      toast.error(`Only ${selectedPerfume.quantity} units in stock`);
      return;
    }
    if (!price || price <= 0) {
      toast.error("Enter a valid sale price");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("perfume_id", selectedPerfume.id);
      formData.set("quantity_sold", String(qty));
      formData.set("unit_price", String(price));
      formData.set("customer_name", customerName);
      formData.set("notes", notes);

      await recordSale(formData);
      toast.success(`Sold ${qty}× ${selectedPerfume.brand} ${selectedPerfume.scent_name}`);
      reset();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record sale");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount =
    selectedPerfume && Number(quantity) && Number(unitPrice)
      ? Number(quantity) * Number(unitPrice)
      : 0;

  const totalProfit =
    selectedPerfume && Number(quantity) && Number(unitPrice)
      ? Number(quantity) * (Number(unitPrice) - selectedPerfume.cost_price)
      : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-full max-w-[calc(100%-2rem)] max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record a Sale</DialogTitle>
          <DialogDescription>
            Mark a product as sold. Inventory will be updated automatically.
          </DialogDescription>
        </DialogHeader>

        <Separator className="bg-border" />

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              if (selectedPerfume) void handleSubmit(e as unknown as React.FormEvent);
            }
          }}
        >
          {/* Perfume selector */}
          {!preselectedPerfume && (
            <div className="space-y-2">
              <Label className="text-foreground">Select Perfume</Label>
              <select
                value={perfumeId}
                onChange={(event) => handlePerfumeChange(event.target.value)}
                className="h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground outline-none"
              >
                <option value="">Choose a perfume…</option>
                {perfumes
                  .filter((p) => p.quantity > 0)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand} — {p.scent_name} ({p.quantity} in stock)
                    </option>
                  ))}
              </select>
            </div>
          )}

          {preselectedPerfume && (
            <div className="rounded-lg border border-border bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Selling</p>
              <p className="font-medium text-foreground">
                {preselectedPerfume.brand} — {preselectedPerfume.scent_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {preselectedPerfume.quantity} in stock · Cost:{" "}
                {formatPhp(preselectedPerfume.cost_price)}
              </p>
            </div>
          )}

          {/* Quantity + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Quantity</Label>
              <Input
                ref={quantityRef}
                type="number"
                min="1"
                max={selectedPerfume?.quantity ?? 999}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
                className="border-border bg-secondary text-foreground"
              />
              {selectedPerfume && (
                <p className="text-[10px] text-muted-foreground">
                  Max: {selectedPerfume.quantity}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Unit Price (PHP)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(event) => setUnitPrice(event.target.value)}
                required
                className="border-border bg-secondary text-foreground"
              />
            </div>
          </div>

          {/* Customer + Notes */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">Customer Name (optional)</Label>
              <Input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Walk-in"
                className="border-border bg-secondary text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Gift wrapping, promo, etc."
                className="border-border bg-secondary text-foreground"
              />
            </div>
          </div>

          {/* Summary */}
          {selectedPerfume && totalAmount > 0 && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-secondary/50 p-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Total Sale
                </p>
                <p className="font-display text-lg text-foreground">
                  {formatPhp(totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Profit
                </p>
                <p
                  className={`font-display text-lg ${
                    totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatPhp(totalProfit)}
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !selectedPerfume}
            className="w-full text-xs uppercase tracking-wider"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirm Sale"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
