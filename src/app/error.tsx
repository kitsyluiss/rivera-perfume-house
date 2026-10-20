"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-card/60 p-8 backdrop-blur-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="font-display text-2xl text-white font-light mb-2">
          Unable to Load Fragrance Collection
        </h2>
        <p className="text-white/60 text-xs sm:text-sm font-body leading-relaxed mb-4">
          A temporary connection issue occurred while communicating with our catalog. Please try refreshing the page.
        </p>

        {error.digest && (
          <div className="mb-6 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-left">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Error Reference</p>
            <p className="font-mono text-xs text-primary truncate select-all">{error.digest}</p>
          </div>
        )}

        <Button
          onClick={() => reset()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-[0.98]"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Reload Collection
        </Button>
      </div>
    </main>
  );
}
