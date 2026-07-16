"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function ImageUpload({ file, onFileChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!file) {
      queueMicrotask(() => {
        if (active) {
          setPreview(null);
        }
      });
      return () => {
        active = false;
      };
    }

    const nextPreview = URL.createObjectURL(file);
    queueMicrotask(() => {
      if (active) {
        setPreview(nextPreview);
      }
    });

    return () => {
      active = false;
      URL.revokeObjectURL(nextPreview);
    };
  }, [file]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        onFileChange(accepted[0]);
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-border bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7"
            onClick={() => onFileChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex aspect-[3/2] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors duration-200 ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-secondary/50 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-center text-sm text-muted-foreground">
            {isDragActive ? "Drop the image here..." : "Drag & drop an image, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            JPG, PNG, WebP — max 5 MB
          </p>
        </div>
      )}
    </div>
  );
}