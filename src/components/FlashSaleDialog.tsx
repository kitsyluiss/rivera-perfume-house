"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  const [minutes, setMinutes] = useState("0");
  const [stockLimit, setStockLimit] = useState("");
  const [eventName, setEventName] = useState("");
  const [showEventDropdown, setShowEventDropdown] = useState(false);

  const EVENT_OPTIONS = [
    "Payday Sale",
    "8.8 Sale",
    "9.9 Sale",
    "10.10 Sale",
    "11.11 Sale",
    "12.12 Sale",
    "Midnight Sale",
    "Weekend Sale",
  ];

  const isActive = perfume?.flash_sale_price != null && 
    perfume?.flash_sale_end != null && 
    new Date(perfume.flash_sale_end) > new Date();

  useEffect(() => {
    if (open && perfume) {
      setSalePrice(perfume.flash_sale_price ? String(perfume.flash_sale_price) : "");
      
      if (perfume.flash_sale_end && new Date(perfume.flash_sale_end) > new Date()) {
        const remainingMs = new Date(perfume.flash_sale_end).getTime() - new Date().getTime();
        const hrs = Math.floor(remainingMs / (1000 * 60 * 60));
        const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setHours(String(hrs));
        setMinutes(String(mins));
      } else {
        setHours("24");
        setMinutes("0");
      }
      
      setStockLimit(perfume.flash_sale_stock != null ? String(perfume.flash_sale_stock) : String(perfume.quantity));
      setEventName(perfume.flash_sale_name || "");
      setShowEventDropdown(false);
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
      endDate.setMinutes(endDate.getMinutes() + Number(minutes));
      
      const parsedStock = stockLimit ? Number(stockLimit) : null;
      const finalEventName = eventName.trim() || null;

      await setFlashSale(perfume.id, numSalePrice, endDate.toISOString(), parsedStock, finalEventName);
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
      await setFlashSale(perfume.id, null, null, null, null);
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

          <div className="space-y-2 relative">
            <Label htmlFor="eventName" className="text-foreground">Event Name (Optional)</Label>
            <div className="relative">
              <Input
                id="eventName"
                placeholder="e.g. Payday Sale, 8.8 Sale..."
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                onFocus={() => setShowEventDropdown(true)}
                onBlur={() => setTimeout(() => setShowEventDropdown(false), 200)}
                className="bg-secondary border-border focus:border-primary/40 h-11 text-base text-foreground font-body pr-10"
              />
              <button 
                type="button"
                onClick={() => setShowEventDropdown(!showEventDropdown)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            
            <AnimatePresence>
              {showEventDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -5, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute z-50 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                >
                  <div className="max-h-[200px] overflow-y-auto scrollbar-none p-1">
                    {EVENT_OPTIONS.filter(opt => opt.toLowerCase().includes(eventName.toLowerCase())).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onMouseDown={() => {
                          setEventName(option);
                          setShowEventDropdown(false);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary text-foreground"
                      >
                        {option}
                        {eventName === option && <Check className="h-3 w-3 text-primary" />}
                      </button>
                    ))}
                    {eventName && !EVENT_OPTIONS.some(opt => opt.toLowerCase() === eventName.toLowerCase()) && (
                      <button
                        type="button"
                        onMouseDown={() => setShowEventDropdown(false)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary text-primary font-medium"
                      >
                        Use &ldquo;{eventName}&rdquo;
                        <Check className="h-3 w-3 text-primary" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours" className="text-foreground">Duration (Hours)</Label>
              <Input 
                id="hours" 
                type="number" 
                required 
                min="0"
                max="168"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="bg-secondary border-border focus:border-primary/40 h-11 text-base text-foreground font-body"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes" className="text-foreground">Minutes</Label>
              <Input 
                id="minutes" 
                type="number" 
                required 
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="bg-secondary border-border focus:border-primary/40 h-11 text-base text-foreground font-body"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stockLimit" className="text-foreground">Stock Limit (Optional)</Label>
            <Input 
              id="stockLimit" 
              type="number" 
              min="1"
              max={perfume.quantity}
              value={stockLimit}
              onChange={(e) => setStockLimit(e.target.value)}
              placeholder={`Max available: ${perfume.quantity}`}
              className="bg-secondary border-border focus:border-primary/40 h-11 text-base text-foreground font-body"
            />
            <p className="text-xs text-muted-foreground pt-1">If this stock reaches 0, the sale will end automatically even if there is time remaining.</p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            {isActive && (
              <Button type="button" variant="destructive" onClick={handleCancelSale} disabled={loading} className="mr-auto bg-destructive/10 text-destructive hover:bg-destructive/20 border-none">
                End Sale Now
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isValidPrice} className="bg-primary text-primary-foreground">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isActive ? "Update Flash Sale" : "Set Flash Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
