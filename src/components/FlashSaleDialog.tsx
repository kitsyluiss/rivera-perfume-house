"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Perfume } from "@/lib/types";
import { setFlashSale } from "@/lib/actions";
import { formatPhp } from "@/lib/format";

export default function FlashSaleDialog({
  open,
  onOpenChange,
  perfume,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfume: Perfume | null;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [hours, setHours] = useState("24");

  useEffect(() => {
    if (open && perfume) {
      setSalePrice(perfume.flash_sale_price ? String(perfume.flash_sale_price) : "");
      setHours("24"); // Default 24 hours
    }
  }, [open, perfume]);

  if (!perfume) return null;

  const numSalePrice = Number(salePrice);
  const isValidPrice = numSalePrice > 0 && numSalePrice < perfume.target_sale_price;
  const percentOff = isValidPrice 
    ? Math.round(((perfume.target_sale_price - numSalePrice) / perfume.target_sale_price) * 100)
    : 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidPrice) {
      toast.error("Sale price must be greater than 0 and less than the original price.");
      return;
    }

    setLoading(true);
    try {
      const endDate = new Date();
      endDate.setHours(endDate.getHours() + Number(hours));
      
      await setFlashSale(perfume.id, numSalePrice, endDate.toISOString());
      toast.success("Flash sale activated!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSale = async () => {
    setLoading(true);
    try {
      await setFlashSale(perfume.id, null, null);
      toast.success("Flash sale cancelled");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide">Flash Sale: {perfume.scent_name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="rounded-lg bg-secondary/30 p-4 border border-border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Original Price:</span>
              <span className="font-medium text-foreground">{formatPhp(perfume.target_sale_price)}</span>
            </div>
            {isValidPrice && (
              <div className="flex justify-between items-center mt-2 border-t border-border/50 pt-2">
                <span className="text-sm text-primary font-medium">Discount:</span>
                <span className="font-bold text-primary">-{percentOff}% OFF</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="salePrice" className="text-foreground">Flash Sale Price (₱)</Label>
            <Input 
              id="salePrice" 
              type="number" 
              required 
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder={`e.g. ${Math.round(perfume.target_sale_price * 0.8)}`} 
              className="bg-secondary border-border focus:border-primary/40 h-11 text-base text-foreground font-body"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hours" className="text-foreground">Duration (Hours)</Label>
            <Input 
              id="hours" 
              type="number" 
              required 
              min="1"
              max="168"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="bg-secondary border-border focus:border-primary/40 h-11 text-base text-foreground font-body"
            />
            <p className="text-xs text-muted-foreground pt-1">The sale will automatically expire after this time.</p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            {perfume.flash_sale_price && (
              <Button type="button" variant="destructive" onClick={handleCancelSale} disabled={loading} className="mr-auto bg-destructive/10 text-destructive hover:bg-destructive/20 border-none">
                End Sale Now
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isValidPrice} className="bg-primary text-primary-foreground">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set Flash Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
