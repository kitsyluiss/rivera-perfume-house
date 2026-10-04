"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, RotateCcw } from "lucide-react";
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
import ImageUpload from "@/components/ImageUpload";
import { addPerfume } from "@/lib/actions";
import { toast } from "sonner";
import { PERFUME_TAGS, inferPerfumeTag, type PerfumeTag } from "@/lib/perfume-tags";
import { Perfume } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  existingPerfumes?: Perfume[];
}

type Mode = "new" | "restock";

export default function AddPerfumeForm({
  open,
  onOpenChange,
  onSuccess,
  existingPerfumes = [],
}: Props) {
  const [mode, setMode] = useState<Mode>("new");
  const [restockSearch, setRestockSearch] = useState("");
  const [restockSource, setRestockSource] = useState<Perfume | null>(null);

  const [brand, setBrand] = useState("");
  const [scentName, setScentName] = useState("");
  const [tag, setTag] = useState<PerfumeTag>(PERFUME_TAGS[0].value);
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setMode("new");
    setRestockSearch("");
    setRestockSource(null);
    setBrand("");
    setScentName("");
    setTag(PERFUME_TAGS[0].value);
    setQuantity("");
    setCostPrice("");
    setTargetPrice("");
    setImage(null);
  };

  // Unique fragrances for restock search (dedup by brand+scent)
  const uniqueFragrances = useMemo(() => {
    const seen = new Map<string, Perfume>();
    for (const p of existingPerfumes) {
      const key = `${p.brand.toLowerCase()}||${p.scent_name.toLowerCase()}`;
      if (!seen.has(key)) seen.set(key, p);
    }
    return [...seen.values()];
  }, [existingPerfumes]);

  const searchResults = useMemo(() => {
    if (!restockSearch.trim()) return uniqueFragrances;
    const q = restockSearch.toLowerCase();
    return uniqueFragrances.filter(
      (p) =>
        p.brand.toLowerCase().includes(q) ||
        p.scent_name.toLowerCase().includes(q)
    );
  }, [restockSearch, uniqueFragrances]);

  // Pre-fill form from selected existing perfume
  const selectRestock = (perfume: Perfume) => {
    setRestockSource(perfume);
    setBrand(perfume.brand);
    setScentName(perfume.scent_name);
    setTag(inferPerfumeTag(perfume));
    setCostPrice(String(perfume.cost_price));
    setTargetPrice(String(perfume.target_sale_price));
    setQuantity("");
    setImage(null);
    setRestockSearch("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("brand", brand);
      formData.set("scent_name", scentName);
      formData.set("tag", tag);
      formData.set("quantity", quantity);
      formData.set("cost_price", costPrice);
      formData.set("target_sale_price", targetPrice);

      if (image) {
        formData.set("image", image);
      } else if (mode === "restock" && restockSource?.image_url) {
        // Carry the existing image URL via a special field
        formData.set("existing_image_url", restockSource.image_url);
      }

      const res = await addPerfume(formData);
      if (res?.error) throw new Error(res.error);
      toast.success(
        mode === "restock"
          ? `Stock added for ${brand} — ${scentName}`
          : "Perfume added"
      );
      reset();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add perfume");
    } finally {
      setLoading(false);
    }
  };

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
          <DialogTitle>Add Perfume</DialogTitle>
          <DialogDescription>
            Add a new fragrance or restock an existing one under your ownership.
          </DialogDescription>
        </DialogHeader>

        <Separator className="bg-border my-1" />

        {/* Mode toggle */}
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 p-1.5 mb-2">
          <button
            type="button"
            onClick={() => { setMode("new"); setRestockSource(null); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[10px] uppercase tracking-[0.18em] transition-colors ${
              mode === "new"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus className="h-3 w-3" />
            New Fragrance
          </button>
          <button
            type="button"
            onClick={() => setMode("restock")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[10px] uppercase tracking-[0.18em] transition-colors ${
              mode === "restock"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <RotateCcw className="h-3 w-3" />
            Restock Existing
          </button>
        </div>

        {/* Restock search */}
        {mode === "restock" && !restockSource && (
          <div className="space-y-3">
            <Input
              placeholder="Search brand or scent name…"
              value={restockSearch}
              onChange={(e) => setRestockSearch(e.target.value)}
              className="border-border bg-secondary text-foreground h-11"
              autoFocus
            />
            <div className="space-y-2 rounded-xl border border-border bg-card p-2.5 max-h-[260px] overflow-y-auto scrollbar-none">
              {searchResults.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No matches found</p>
              ) : (
                searchResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectRestock(p)}
                    className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-secondary"
                  >
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.scent_name} className="h-11 w-11 shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="h-11 w-11 shrink-0 rounded-md bg-secondary" />
                    )}
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{p.brand}</p>
                      <p className="truncate text-sm text-foreground">{p.scent_name}</p>
                      <p className="text-[10px] text-muted-foreground">{inferPerfumeTag(p)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Selected restock source banner */}
        {mode === "restock" && restockSource && (
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 mb-2">
            {restockSource.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={restockSource.image_url} alt={restockSource.scent_name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded-lg bg-secondary" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{restockSource.brand}</p>
              <p className="text-sm font-medium text-foreground">{restockSource.scent_name}</p>
              <p className="text-[10px] text-muted-foreground">Details pre-filled — set your quantity below</p>
            </div>
            <button
              type="button"
              onClick={() => { setRestockSource(null); setBrand(""); setScentName(""); }}
              className="text-[10px] text-muted-foreground underline hover:text-foreground"
            >
              Change
            </button>
          </div>
        )}

        {/* Main form — shown when: new mode, OR restock with source selected */}
        {(mode === "new" || restockSource) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image upload — in restock mode, show existing image as preview */}
            {mode === "new" && (
              <ImageUpload file={image} onFileChange={setImage} />
            )}
            {mode === "restock" && (
              <div className="space-y-2">
                <Label className="text-foreground">Image <span className="text-muted-foreground">(optional — overrides existing)</span></Label>
                <ImageUpload file={image} onFileChange={setImage} />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">Brand</Label>
                <Input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                  placeholder="Chanel"
                  className="border-border bg-secondary text-foreground h-11"
                  readOnly={mode === "restock" && !!restockSource}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Scent Name</Label>
                <Input
                  value={scentName}
                  onChange={(e) => setScentName(e.target.value)}
                  required
                  placeholder="Noir 5"
                  className="border-border bg-secondary text-foreground h-11"
                  readOnly={mode === "restock" && !!restockSource}
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="space-y-3">
              <Label className="text-foreground">Category</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PERFUME_TAGS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTag(option.value)}
                    className={`rounded-full border px-3 py-2.5 text-[11px] uppercase tracking-[0.18em] transition-all duration-150 ${
                      tag === option.value
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_10px_hsl(38_44%_61%/0.2)]"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {option.value}
                  </button>
                ))}
              </div>
              {(() => {
                const selected = PERFUME_TAGS.find((o) => o.value === tag);
                return selected ? (
                  <div className="space-y-1 rounded-lg border border-border bg-card/50 px-3.5 py-2.5 text-xs text-muted-foreground">
                    <div><span className="text-foreground/60 font-medium">Best for:</span> {selected.bestFor}</div>
                    <div><span className="text-foreground/60 font-medium">The vibe:</span> {selected.vibe}</div>
                  </div>
                ) : null;
              })()}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-foreground">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  autoFocus={mode === "restock" && !!restockSource}
                  className="border-border bg-secondary text-foreground h-11"
                  placeholder={mode === "restock" ? "Your qty" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Cost Price (PHP)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  required
                  className="border-border bg-secondary text-foreground h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Target Price (PHP)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  required
                  className="border-border bg-secondary text-foreground h-11"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full text-xs uppercase tracking-wider h-11 mt-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "restock" ? (
                `Add My Stock — ${scentName || "…"}`
              ) : (
                "Add Perfume"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}