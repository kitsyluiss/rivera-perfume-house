"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { SendHorizontal, X } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

interface Pick {
  id: string;
  slug: string;
  scent_name: string;
  brand: string;
  price: number;
}

interface ChatEntry {
  role: "user" | "assistant";
  text: string;
  picks?: Pick[];
}

const STARTERS = [
  "Fresh for a hot commute",
  "Date night under ₱2,000",
  "Long-lasting for office AC",
];

export default function AiSuggestorPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  // Last 4 exchanges so follow-ups ("give me more") remember prior picks.
  const historyOf = (entries: ChatEntry[]) =>
    entries.slice(-8).map(({ role, text }) => ({ role, content: text }));

  // Focus moves into the dialog on open and returns to the trigger on close.
  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
    } else {
      prevFocus.current?.focus();
      prevFocus.current = null;
    }
  }, [open]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, loading]);

  // Minimal focus trap: Tab cycles inside the sheet.
  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  async function ask(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history: historyOf(messages) }),
      });
      const data = (await res.json()) as { reply?: string; picks?: Pick[] };
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: res.ok && data.reply ? data.reply : FALLBACK_TEXT,
          picks: res.ok ? data.picks ?? [] : [],
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: FALLBACK_TEXT, picks: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sommelier-backdrop"
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="sommelier-sheet"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sommelier-title"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              trapTab(e);
            }}
            className="fixed inset-x-3 z-[61] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/95 shadow-2xl shadow-black/80 backdrop-blur-xl outline-none"
            style={{ bottom: "calc(88px + env(safe-area-inset-bottom))", maxHeight: "68dvh" }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease }}
          >
            <div className="flex items-start justify-between border-b border-white/[0.06] px-4 pb-3 pt-4">
              <div>
                <h2
                  id="sommelier-title"
                  className="font-display text-xl font-medium tracking-wide text-[#e1b854]"
                >
                  Fragrance Sommelier
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  Curated from today&rsquo;s available stock only
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sommelier"
                className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && !loading && (
                <p className="text-sm leading-relaxed text-white/55">
                  Tell me the occasion, the weather you&rsquo;ll face, or your budget — I&rsquo;ll
                  pick from what&rsquo;s in stock today.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-6 rounded-xl border border-[#e1b854]/20 bg-[#e1b854]/[0.08] px-3 py-2.5 text-sm text-white/90"
                      : "mr-2 whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2.5 text-sm leading-relaxed text-white/85"
                  }
                >
                  {m.text}
                  {m.picks && m.picks.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {m.picks.map((p) => (
                        <a
                          key={p.id}
                          href={`/perfumes/${p.slug}`}
                          className="rounded-full border border-[#e1b854]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#e1b854] transition-colors hover:bg-[#e1b854]/10 active:scale-95"
                        >
                          {p.scent_name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="mr-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2.5 text-sm text-white/50">
                  {reduceMotion ? (
                    "Consulting today's collection…"
                  ) : (
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    >
                      Consulting today&rsquo;s collection…
                    </motion.span>
                  )}
                </div>
              )}
            </div>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-[#e1b854]/40 hover:text-white active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-white/[0.06] px-3 py-3"
            >
              <label htmlFor="sommelier-input" className="sr-only">
                Ask the sommelier for a perfume recommendation
              </label>
              <input
                ref={inputRef}
                id="sommelier-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Occasion, budget, or vibe…"
                autoComplete="off"
                className="h-10 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#e1b854]/50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send question"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#f9d976] to-[#bd9135] text-black transition-all hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:hover:brightness-100"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const FALLBACK_TEXT =
  "The sommelier is taking a short break — please try again in a moment.";
