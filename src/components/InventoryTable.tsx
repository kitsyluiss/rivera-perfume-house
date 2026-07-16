"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2, ShoppingCart, ChevronDown, Camera } from "lucide-react";
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
      {/* ── Mobile card list ─────────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {perfumes.map((perfume) => {
          const profit = perfume.quantity * (perfume.target_sale_price - perfume.cost_price);
          const tag = inferPerfumeTag(perfume);

          return (
            <div
              key={perfume.id}
              className="rounded-xl border border-border bg-card p-4"
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

              <div className="mt-2 flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Profit</p>
                <p className={`text-sm font-medium ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatPhp(profit)}
                </p>
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
                <TableHead className="w-10 text-muted-foreground" />
                <TableHead className="text-muted-foreground">Brand</TableHead>
                <TableHead className="text-muted-foreground">Scent</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Added By</TableHead>
                <TableHead className="text-right text-muted-foreground">Qty</TableHead>
                <TableHead className="text-right text-muted-foreground">Cost (PHP)</TableHead>
                <TableHead className="text-right text-muted-foreground">Target (PHP)</TableHead>
                <TableHead className="text-right text-muted-foreground">Profit</TableHead>
                <TableHead className="w-12 text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {perfumes.map((perfume) => {
                const profit = perfume.quantity * (perfume.target_sale_price - perfume.cost_price);
                const tag = inferPerfumeTag(perfume);

                return (
                  <TableRow key={perfume.id} className="border-border">
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
    </>
  );
}