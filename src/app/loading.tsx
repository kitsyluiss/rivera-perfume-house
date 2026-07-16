"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-4">
        {/* Pulsing logo icon skeleton */}
        <div className="relative h-14 w-14 animate-pulse rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 animate-ping absolute" />
          {/* logo flower container */}
          <div className="h-5 w-5 rounded-sm bg-primary/30 rotate-45" />
        </div>

        {/* Pulsing Text Logo */}
        <div className="flex flex-col items-center gap-1 text-center animate-pulse">
          <span className="font-display text-lg font-light tracking-[0.3em] text-primary">
            RIVERA
          </span>
          <span className="text-[8px] tracking-[0.35em] text-muted-foreground/60">
            PERFUME HOUSE
          </span>
        </div>

        {/* Delicate golden progress shimmer line */}
        <div className="mt-2 h-[1px] w-20 overflow-hidden rounded bg-white/[0.05]">
          <div className="h-full w-full origin-left animate-[loading-bar_1.5s_infinite_ease-in-out] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
      </div>

      {/* Tailwind inline animation style if not defined */}
      <style jsx global>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
