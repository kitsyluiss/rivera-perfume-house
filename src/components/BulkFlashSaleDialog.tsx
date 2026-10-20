"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { setBulkFlashSale } from "@/lib/actions";
import { motion, AnimatePresence } from "motion/react";

export default function BulkFlashSaleDialog({
  open,
  onOpenChange,
  selectedIds,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("20");
  const [hours, setHours] = useState("24");
  const [minutes, setMinutes] = useState("0");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hrs = parseInt(hours) || 0;
      const mins = parseInt(minutes) || 0;
      const end = new Date();
      end.setHours(end.getHours() + hrs);
      end.setMinutes(end.getMinutes() + mins);

      await setBulkFlashSale(
        selectedIds, 
        parseInt(discountPercent), 
        end.toISOString(),
        eventName || null
      );
      
      toast.success(`Bulk flash sale applied to ${selectedIds.length} items!`);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSales = async () => {
    setLoading(true);
    try {
      // Set to null to end sales
      await setBulkFlashSale(
        selectedIds,
        0,
        null,
        null
      );
      toast.success(`Ended flash sales for ${selectedIds.length} items!`);
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
      <DialogContent className="sm:max-w-[425px] border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Bulk Flash Sale</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="space-y-2 relative">
            <Label htmlFor="bulkEventName" className="text-foreground">Event Name (Optional)</Label>
            <div className="relative">
              <Input
                id="bulkEventName"
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
            <Label className="text-foreground">Discount Percentage</Label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                max="99"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                required
                className="bg-secondary border-border focus:border-primary/40 h-11 text-base text-foreground font-body pl-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Hours</Label>
              <Input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
                className="bg-secondary border-border focus:border-primary/40 h-11 text-base text-foreground font-body"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Minutes</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                required
                className="bg-secondary border-border focus:border-primary/40 h-11 text-base text-foreground font-body"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 text-sm font-semibold tracking-wide"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Apply to ${selectedIds.length} Items`}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              disabled={loading}
              onClick={handleEndSales}
              className="w-full h-12 text-sm font-semibold tracking-wide text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30"
            >
              End Sales Now
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
