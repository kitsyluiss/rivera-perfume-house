"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, Camera, ChevronDown, Loader2, Search, ShoppingCart, Trash2, X, Zap } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Perfume } from "@/lib/types";
import { deletePerfume, updatePerfume, updatePerfumePhoto } from "@/lib/actions";
import { formatPhp } from "@/lib/format";
import { toast } from "sonner";
import { inferPerfumeTag, PERFUME_TAGS, type PerfumeTag } from "@/lib/perfume-tags";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageUpload from "@/components/ImageUpload";
import FlashSaleDialog from "@/components/FlashSaleDialog";
import BulkFlashSaleDialog from "@/components/BulkFlashSaleDialog";
import { useCountdown } from "@/hooks/useCountdown";
import { motion, AnimatePresence } from "motion/react";

function FlashSaleButton({ perfume, onClick }: { perfume: Perfume, onClick: () => void }) {
  const hasFlashSale = perfume.flash_sale_price != null && 
    perfume.flash_sale_end != null && 
    new Date(perfume.flash_sale_end) > new Date() &&
    (perfume.flash_sale_stock == null || perfume.flash_sale_stock > 0);

  const { timeLeft, isExpired } = useCountdown(hasFlashSale ? perfume.flash_sale_end! : null);

  const isActive = hasFlashSale && !isExpired;

  return (
    <Button
      variant="ghost"
      size={isActive ? "sm" : "icon"}
      className={`h-8 transition-colors ${
        isActive 
          ? "px-2 border border-yellow-500/50 text-yellow-500 hover:text-yellow-600 hover:border-yellow-500/80 animate-pulse bg-yellow-500/10" 
          : "w-8 text-muted-foreground hover:text-yellow-500"
      }`}
      onClick={onClick}
      title="Flash Sale"
    >
      <Zap className={`h-4 w-4 ${isActive ? "mr-1.5" : ""}`} />
      {isActive && timeLeft && <span className="font-mono text-[10px] tracking-wider">{timeLeft}</span>}
    </Button>
  );
}

type InvSortKey = "brand" | "scent_name" | "quantity" | "cost_price" | "target_sale_price" | "profit" | "added_by";
type SortDir = "asc" | "desc";

function SortIcon({ col, active, dir }: { col: string; active: string; dir: SortDir }) {
  if (col !== active) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />;
  return dir === "asc"
    ? <ArrowUp className="ml-1 inline h-3 w-3 text-primary" />
    : <ArrowDown className="ml-1 inline h-3 w-3 text-primary" />;
}

function SortableHead({
  col, active, dir, onSort, className, children,
}: {
  col: InvSortKey; active: InvSortKey | null; dir: SortDir;
  onSort: (col: InvSortKey) => void; className?: string; children: React.ReactNode;
}) {
  return (
    <TableHead
      className={`cursor-pointer select-none whitespace-nowrap ${className ?? ""}`}
      onClick={() => onSort(col)}
    >
      {children}
      <SortIcon col={col} active={active ?? ""} dir={dir} />
    </TableHead>
  );
}

function EditableCell({
  value,
  onSave,
  prefix = "",
  format,
  step,
}: {
  value: number | null;
  onSave: (nextValue: number) => Promise<void>;
  prefix?: string;
  format?: (value: number) => string;
  step?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const commit = async () => {
    setEditing(false);
    const nextValue = Number.parseFloat(draft);

    if (Number.isNaN(nextValue) || nextValue === value) {
      return;
    }

    setSaving(true);
    try {
      await onSave(nextValue);
      toast.success("Updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
      setDraft(value?.toString() ?? "");
    } finally {
      setSaving(false);
    }
  };

  if (saving) {
    return <Loader2 className="inline h-3 w-3 animate-spin text-primary" />;
  }

  if (editing) {
    return (
      <Input
        type="number"
        step={step}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && (event.target as HTMLInputElement).blur()}
        className="h-7 w-24 bg-secondary px-2 text-sm text-foreground"
        autoFocus
      />
    );
  }

  return (
    <span
      className="cursor-pointer underline-offset-2 transition-colors hover:text-primary hover:underline"
      onClick={() => {
        setDraft(value?.toString() ?? "");
        setEditing(true);
      }}
      title="Click to edit"
    >
      {prefix}
      {value != null
        ? format?.(value) ?? value.toLocaleString("en-US", { minimumFractionDigits: step ? 2 : 0 })
        : "—"}
    </span>
  );
}

function EditableTagCell({
  value,
  onSave,
}: {
  value: PerfumeTag;
  onSave: (nextValue: PerfumeTag) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const commit = async (nextValue: PerfumeTag) => {
    setOpen(false);
    if (nextValue === value) return;
    setSaving(true);
    try {
      await onSave(nextValue);
      toast.success("Updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (saving) {
    return <Loader2 className="inline h-3 w-3 animate-spin text-primary" />;
  }

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] text-foreground transition hover:border-primary/40 focus:outline-none"
      >
        {value}
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-[300] mt-1.5 min-w-[140px] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          {PERFUME_TAGS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => void commit(option.value)}
              className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-xs transition-colors hover:bg-secondary ${
                option.value === value
                  ? "text-primary"
                  : "text-foreground"
              }`}
            >
              {option.value}
              {option.value === value && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


export default function InventoryTable({
  perfumes,
  loading,
  onUpdate,
  onSell,
}: {
  perfumes: Perfume[];
  loading: boolean;
  onUpdate: () => void;
  onSell?: (perfume: Perfume) => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Perfume | null>(null);
  const [photoTarget, setPhotoTarget] = useState<Perfume | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [flashSaleTarget, setFlashSaleTarget] = useState<Perfume | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkFlashSale, setShowBulkFlashSale] = useState(false);
  const [sortKey, setSortKey] = useState<InvSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchRaw, setSearchRaw] = useState("");
  const [search, setSearch] = useState("");

  // Debounce search input 200 ms
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((val: string) => {
    setSearchRaw(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 200);
  }, []);

  const handleSort = (col: InvSortKey) => {
    if (sortKey === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(col);
      setSortDir("asc");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (data: Perfume[]) => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(p => p.id));
    }
  };

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const base = [...perfumes].filter((p) => {
      if (!q) return true;
      return (
        p.brand.toLowerCase().includes(q) ||
        p.scent_name.toLowerCase().includes(q) ||
        (p.added_by ?? "").toLowerCase().includes(q)
      );
    });
    if (!sortKey) {
      return base.sort((a, b) => {
        if (a.quantity === 0 && b.quantity > 0) return 1;
        if (a.quantity > 0 && b.quantity === 0) return -1;
        return 0;
      });
    }
    return base.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sortKey === "profit") {
        av = a.quantity * (a.target_sale_price - a.cost_price);
        bv = b.quantity * (b.target_sale_price - b.cost_price);
      } else if (sortKey === "added_by") {
        av = a.added_by ?? "";
        bv = b.added_by ?? "";
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [perfumes, sortKey, sortDir, search]);

  const handleUpdate = (id: string, field: string) => async (nextValue: number) => {
    await updatePerfume(id, { [field]: nextValue });
    onUpdate();
  };

  const handlePhotoUpdate = async () => {
    if (!photoTarget || !photoFile) return;
    setUploadingPhoto(true);
    try {
      await updatePerfumePhoto(photoTarget.id, photoFile);
      toast.success("Photo updated successfully");
      setPhotoFile(null);
      setPhotoTarget(null);
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const executeDelete = async (perfume: Perfume) => {
    setDeletingId(perfume.id);
    try {
      await deletePerfume(perfume.id, perfume.image_url);
      toast.success("Perfume deleted");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-[1.1rem] border border-border bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-secondary animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-16 rounded-full bg-secondary animate-pulse" />
                  <div className="h-3.5 w-32 rounded-full bg-secondary animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="space-y-1.5">
                    <div className="h-2 w-8 rounded-full bg-secondary animate-pulse" />
                    <div className="h-3.5 w-14 rounded-full bg-secondary animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Desktop skeleton */}
        <div className="hidden md:block overflow-hidden rounded-[1.1rem] border border-border">
          <div className="divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-10 w-10 rounded-md bg-secondary animate-pulse shrink-0" />
                <div className="h-3 w-24 rounded-full bg-secondary animate-pulse" />
                <div className="h-3 w-28 rounded-full bg-secondary animate-pulse" />
                <div className="h-3 w-16 rounded-full bg-secondary animate-pulse ml-auto" />
                <div className="h-3 w-20 rounded-full bg-secondary animate-pulse" />
                <div className="h-3 w-20 rounded-full bg-secondary animate-pulse" />
                <div className="h-3 w-20 rounded-full bg-secondary animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (perfumes.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        No perfumes yet. Add your first one above.
      </div>
    );
  }

  // Stable color per display name
  const avatarColors = [
    "bg-primary/20 text-primary border-primary/30",
    "bg-emerald-900/40 text-emerald-300 border-emerald-700/40",
    "bg-violet-900/40 text-violet-300 border-violet-700/40",
    "bg-rose-900/40 text-rose-300 border-rose-700/40",
    "bg-amber-900/40 text-amber-300 border-amber-700/40",
  ];

  const getAvatarColor = (name: string | null | undefined) => {
    if (!name) return avatarColors[0];
    const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return avatarColors[sum % avatarColors.length];
  };

  const getInitials = (name: string | null | undefined) =>
    name ? name.slice(0, 2).toUpperCase() : "?";

  return (
    <>
      {/* ── Search bar ─────────────────────────────────────── */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search brand, scent or admin…"
          value={searchRaw}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-border bg-secondary pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40 transition-colors"
        />
        {searchRaw && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Mobile card list ─────────────────────────────── */}
      {/* Mobile sort bar */}
      <div className="flex flex-wrap gap-2 pb-2 md:hidden">
        {([
          ["brand", "Brand"],
          ["added_by", "Admin"],
          ["quantity", "Qty"],
          ["cost_price", "Cost"],
          ["target_sale_price", "Price"],
          ["profit", "Profit"],
        ] as [InvSortKey, string][]).map(([col, label]) => (
          <button
            key={col}
            type="button"
            onClick={() => handleSort(col)}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.15em] transition-colors ${
              sortKey === col
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/25 hover:text-foreground"
            }`}
          >
            {label}
            {sortKey === col ? (
              sortDir === "asc" ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />
            ) : (
              <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3 md:hidden">
        {sorted.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No results for &ldquo;{search}&rdquo;
          </div>
        )}
        {sorted.map((perfume) => {
          const profit = perfume.quantity * (perfume.target_sale_price - perfume.cost_price);
          const margin = perfume.target_sale_price > 0
            ? ((perfume.target_sale_price - perfume.cost_price) / perfume.target_sale_price) * 100
            : 0;
          const isLowStock = perfume.quantity === 1;
          const tag = inferPerfumeTag(perfume);

          return (
            <div
              key={perfume.id}
              className={`rounded-[1.1rem] border bg-card p-4 ${
                isLowStock ? "border-amber-500/40" : "border-border"
              }`}
            >
              {/* Top row: image + name + actions */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setPhotoTarget(perfume)}
                  className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary hover:border-primary/50 transition-colors"
                  title="Update photo"
                >
                  {perfume.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={perfume.image_url}
                      alt={perfume.scent_name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center">
                      <Camera className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="h-3.5 w-3.5 text-primary" />
                  </div>
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{perfume.brand}</p>
                  <p className="truncate text-sm font-medium text-foreground">{perfume.scent_name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <p className="text-[10px] text-muted-foreground">{tag}</p>
                    {isLowStock && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-medium text-amber-400 border border-amber-500/25">
                        <AlertTriangle className="h-2 w-2" />
                        Low
                      </span>
                    )}
                    {perfume.added_by && (
                      <>
                        <span className="text-[9px] text-muted-foreground/40">·</span>
                        <span
                          className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[8px] font-medium tracking-wide ${getAvatarColor(perfume.added_by)}`}
                        >
                          {perfume.added_by}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {onSell && perfume.quantity > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-emerald-400"
                      onClick={() => onSell(perfume)}
                      title="Sell"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 transition-colors ${
                      perfume.flash_sale_price 
                        ? "text-yellow-500 hover:text-yellow-600" 
                        : "text-muted-foreground hover:text-yellow-500"
                    }`}
                    onClick={() => setFlashSaleTarget(perfume)}
                    title="Flash Sale"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-400"
                    onClick={() => setConfirmDelete(perfume)}
                    disabled={deletingId === perfume.id}
                  >
                    {deletingId === perfume.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Qty</p>
                  <p className="mt-0.5 text-sm text-foreground">
                    <EditableCell
                      value={perfume.quantity}
                      onSave={handleUpdate(perfume.id, "quantity")}
                    />
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Cost</p>
                  <p className="mt-0.5 text-sm text-foreground">
                    <EditableCell
                      value={perfume.cost_price}
                      onSave={handleUpdate(perfume.id, "cost_price")}
                      format={formatPhp}
                      step="0.01"
                    />
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Target</p>
                  <p className="mt-0.5 text-sm text-foreground">
                    <EditableCell
                      value={perfume.target_sale_price}
                      onSave={handleUpdate(perfume.id, "target_sale_price")}
                      format={formatPhp}
                      step="0.01"
                    />
                  </p>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Profit</p>
                  <p className={`text-sm font-medium ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatPhp(profit)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Margin</p>
                  <p className={`text-sm font-medium ${margin >= 0 ? "text-emerald-400/80" : "text-red-400"}`}>
                    {margin.toFixed(1)}%
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
                <TableHead className="w-10 text-muted-foreground text-center">
                  <input 
                    type="checkbox" 
                    className="appearance-none h-[18px] w-[18px] rounded-[4px] border border-border/80 bg-transparent checked:bg-primary checked:border-primary cursor-pointer flex items-center justify-center transition-colors checked:after:content-['✓'] checked:after:text-primary-foreground checked:after:text-[12px] checked:after:font-black"
                    checked={selectedIds.length === sorted.length && sorted.length > 0}
                    onChange={() => toggleSelectAll(sorted)}
                  />
                </TableHead>
                <TableHead className="w-10 text-muted-foreground" />
                <SortableHead col="brand" active={sortKey} dir={sortDir} onSort={handleSort} className="text-muted-foreground">Brand</SortableHead>
                <SortableHead col="scent_name" active={sortKey} dir={sortDir} onSort={handleSort} className="text-muted-foreground">Scent</SortableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <SortableHead col="added_by" active={sortKey} dir={sortDir} onSort={handleSort} className="text-muted-foreground">Added By</SortableHead>
                <SortableHead col="quantity" active={sortKey} dir={sortDir} onSort={handleSort} className="text-right text-muted-foreground">Qty</SortableHead>
                <SortableHead col="cost_price" active={sortKey} dir={sortDir} onSort={handleSort} className="text-right text-muted-foreground">Cost (PHP)</SortableHead>
                <SortableHead col="target_sale_price" active={sortKey} dir={sortDir} onSort={handleSort} className="text-right text-muted-foreground">Target (PHP)</SortableHead>
                <SortableHead col="profit" active={sortKey} dir={sortDir} onSort={handleSort} className="text-right text-muted-foreground">Profit</SortableHead>
                <TableHead className="text-right text-muted-foreground whitespace-nowrap">Margin %</TableHead>
                <TableHead className="w-12 text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && search && (
                <TableRow>
                  <TableCell colSpan={11} className="py-12 text-center text-sm text-muted-foreground">
                    No results for &ldquo;{search}&rdquo;
                  </TableCell>
                </TableRow>
              )}
              {sorted.map((perfume) => {
                const profit = perfume.quantity * (perfume.target_sale_price - perfume.cost_price);
                const margin = perfume.target_sale_price > 0
                  ? ((perfume.target_sale_price - perfume.cost_price) / perfume.target_sale_price) * 100
                  : 0;
                const isLowStock = perfume.quantity === 1;
                const tag = inferPerfumeTag(perfume);

                return (
                  <TableRow
                    key={perfume.id}
                    className={`border-border transition-colors ${
                      selectedIds.includes(perfume.id) ? "bg-primary/5" : isLowStock ? "bg-amber-500/[0.03]" : ""
                    }`}
                  >
                    <TableCell className="w-10 text-center">
                      <input 
                        type="checkbox" 
                        className="appearance-none h-[18px] w-[18px] rounded-[4px] border border-border/80 bg-transparent checked:bg-primary checked:border-primary cursor-pointer flex items-center justify-center transition-colors checked:after:content-['✓'] checked:after:text-primary-foreground checked:after:text-[12px] checked:after:font-black"
                        checked={selectedIds.includes(perfume.id)}
                        onChange={() => toggleSelection(perfume.id)}
                      />
                    </TableCell>
                    <TableCell className="w-14">
                      <button
                        type="button"
                        onClick={() => setPhotoTarget(perfume)}
                        className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-secondary hover:border-primary/50 transition-colors cursor-pointer"
                        title="Update photo"
                      >
                        {perfume.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={perfume.image_url}
                            alt={perfume.scent_name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-secondary flex items-center justify-center">
                            <Camera className="h-4 w-4 text-muted-foreground/60" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Camera className="h-3.5 w-3.5 text-primary" />
                        </div>
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{perfume.brand}</TableCell>
                    <TableCell>{perfume.scent_name}</TableCell>
                    <TableCell>
                      <EditableTagCell
                        value={tag}
                        onSave={async (nextValue) => {
                          await updatePerfume(perfume.id, { season: nextValue });
                          onUpdate();
                        }}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {perfume.added_by ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide ${getAvatarColor(perfume.added_by)}`}
                        >
                          {perfume.added_by}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell value={perfume.quantity} onSave={handleUpdate(perfume.id, "quantity")} />
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell
                        value={perfume.cost_price}
                        onSave={handleUpdate(perfume.id, "cost_price")}
                        format={formatPhp}
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell
                        value={perfume.target_sale_price}
                        onSave={handleUpdate(perfume.id, "target_sale_price")}
                        format={formatPhp}
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        profit >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatPhp(profit)}
                    </TableCell>
                    <TableCell className={`text-right text-sm ${
                      margin >= 0 ? "text-emerald-400/70" : "text-red-400"
                    }`}>
                      {margin.toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {onSell && perfume.quantity > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-emerald-400"
                            onClick={() => onSell(perfume)}
                            title="Sell"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        )}
                        <FlashSaleButton 
                          perfume={perfume} 
                          onClick={() => setFlashSaleTarget(perfume)} 
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-400"
                          onClick={() => setConfirmDelete(perfume)}
                          disabled={deletingId === perfume.id}
                        >
                          {deletingId === perfume.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
        title="Delete Perfume"
        description={
          confirmDelete
            ? `Are you sure you want to delete "${confirmDelete.brand} — ${confirmDelete.scent_name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (confirmDelete) void executeDelete(confirmDelete);
        }}
      />

      <Dialog
        open={!!photoTarget}
        onOpenChange={(open) => {
          if (!open) {
            setPhotoTarget(null);
            setPhotoFile(null);
          }
        }}
      >
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide text-foreground">
              Update Photo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-xs text-muted-foreground">
              Update the photo for{" "}
              <span className="text-primary">
                {photoTarget?.brand} &mdash; {photoTarget?.scent_name}
              </span>
              . This will update the image across all entries in the inventory.
            </p>
            <ImageUpload file={photoFile} onFileChange={setPhotoFile} />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPhotoTarget(null);
                  setPhotoFile(null);
                }}
                disabled={uploadingPhoto}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handlePhotoUpdate}
                disabled={!photoFile || uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Save Photo"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FlashSaleDialog 
        open={!!flashSaleTarget}
        onOpenChange={(open) => {
          if (!open) setFlashSaleTarget(null);
        }}
        perfume={flashSaleTarget}
        onSuccess={onUpdate}
      />

      <BulkFlashSaleDialog 
        open={showBulkFlashSale}
        onOpenChange={setShowBulkFlashSale}
        selectedIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([]);
          onUpdate();
        }}
      />

      {/* ── Bulk Actions Bar ───────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full border border-border bg-card/95 px-6 py-3 shadow-2xl backdrop-blur-xl"
          >
            <span className="text-sm font-medium text-foreground">
              {selectedIds.length} selected
            </span>
            <div className="h-4 w-[1px] bg-border" />
            <Button
              size="sm"
              onClick={() => setShowBulkFlashSale(true)}
              className="h-8 rounded-full bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Bulk Flash Sale
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}