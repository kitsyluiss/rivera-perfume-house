"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Package,
  Send,
  Download,
  Key,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPhp } from "@/lib/format";
import { toast } from "sonner";
import { Perfume, Sale, Order } from "@/lib/types";
import { FinancialLedger, calculateFinancialLedger } from "@/lib/accountant-engine";

interface AccountantAssistantProps {
  perfumes: Perfume[];
  sales: Sale[];
  orders: Order[];
  onRefreshData?: () => void;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export default function AccountantAssistant({
  perfumes,
  sales,
  orders,
  onRefreshData,
}: AccountantAssistantProps) {
  const [ledger, setLedger] = useState<FinancialLedger>(() =>
    calculateFinancialLedger(perfumes, sales, orders)
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "assistant",
      text: `### 🏛️ Good day. I am your Executive AI Accountant & Financial Controller.

I monitor your live inventory valuation, calculate exact profit and loss margins, reconcile pending customer receivables, and track your restock capital requirements.

**Live Financial Snapshot:**
- **Inventory Capital Invested (At Cost):** **${formatPhp(ledger.inventory.costValue)}** (${ledger.inventory.totalUnits} bottles)
- **Target Retail Potential:** **${formatPhp(ledger.inventory.retailValue)}** (**${ledger.inventory.projectedMarginPct}%** projected margin)
- **Realized Gross Profit:** **${formatPhp(ledger.sales.totalGrossProfit)}** (**${ledger.sales.grossMarginPct}%** realized margin)
- **Pending Receivables:** **${formatPhp(ledger.orders.pendingReceivables)}** across ${ledger.orders.pendingCount} unverified orders

*Click any quick audit action below or ask me any question about your bookkeeping, tax journals, margins, or reorder budget.*`,
      timestamp: new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
      modelUsed: "gemini-2.5-flash-lite",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Recalculate local ledger when props change
  useEffect(() => {
    const updated = calculateFinancialLedger(perfumes, sales, orders);
    setLedger(updated);
  }, [perfumes, sales, orders]);

  // Load custom key from localStorage if present
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("rivera_gemini_api_key");
      if (savedKey) setCustomApiKey(savedKey);
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSaveApiKey = () => {
    try {
      localStorage.setItem("rivera_gemini_api_key", customApiKey.trim());
      toast.success("Gemini API key saved locally in your browser.");
      setApiKeyModalOpen(false);
    } catch {
      toast.error("Failed to save API key to local storage.");
    }
  };

  const handleSendMessage = async (promptText: string, queryType?: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/accountant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          apiKey: customApiKey.trim() || undefined,
          action: "chat",
          queryType,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.ledger) {
        setLedger(data.ledger);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: data.reply || "No response received.",
        timestamp: new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to communicate with AI Accountant.");
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "assistant",
          text: `⚠️ **Audit Alert**: We encountered an issue connecting to the AI model (${err?.message}). Your database values are safe. Please check your internet connection or verify your Gemini API key in settings.`,
          timestamp: new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ─── CSV Financial Export ──────────────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    const rows = [
      ["--- RIVERA FRAGRANCE HOUSE: EXECUTIVE BALANCE SHEET & LEDGER ---"],
      ["Audit Date", new Date(ledger.timestamp).toLocaleString("en-PH")],
      ["Reporting Currency", "PHP (₱)"],
      [],
      ["--- 1. INVENTORY ASSET VALUATION ---"],
      ["Total SKUs", ledger.inventory.totalSKUs],
      ["Total Physical Bottles in Stock", ledger.inventory.totalUnits],
      ["Total Inventory at Purchase Cost (PHP)", ledger.inventory.costValue.toFixed(2)],
      ["Target Retail Liquidation Value (PHP)", ledger.inventory.retailValue.toFixed(2)],
      ["Unrealized Gross Margin (PHP)", ledger.inventory.projectedGrossProfit.toFixed(2)],
      ["Unrealized Gross Margin %", `${ledger.inventory.projectedMarginPct}%`],
      ["Restock Working Capital Needed (PHP)", ledger.inventory.restockCapitalNeeded.toFixed(2)],
      [],
      ["--- 2. REALIZED HISTORICAL SALES (INCOME STATEMENT) ---"],
      ["Total Sales Count", ledger.sales.totalCount],
      ["Total Bottles Liquidated", ledger.sales.unitsSold],
      ["Gross Sales Turnover (PHP)", ledger.sales.totalRevenue.toFixed(2)],
      ["Realized COGS (PHP)", ledger.sales.totalCost.toFixed(2)],
      ["Realized Gross Profit (PHP)", ledger.sales.totalGrossProfit.toFixed(2)],
      ["Realized Gross Margin %", `${ledger.sales.grossMarginPct}%`],
      ["Average Order Value (AOV PHP)", ledger.sales.averageOrderValue.toFixed(2)],
      [],
      ["--- 3. ORDER RECEIVABLES & CASH FLOW ---"],
      ["Total Orders", ledger.orders.totalOrders],
      ["Pending Verification Orders", ledger.orders.pendingCount],
      ["Unverified Pending Receivables (PHP)", ledger.orders.pendingReceivables.toFixed(2)],
      ["Settled Online Revenue (PHP)", ledger.orders.paidRevenue.toFixed(2)],
      ["Shipping Fees Collected (PHP)", ledger.orders.shippingCollected.toFixed(2)],
      [],
      ["--- 4. CRITICAL RESTOCK REQUIREMENTS (STOCK <= 2) ---"],
      ["Brand", "Scent Name", "Current Stock", "Cost Price", "Target Price", "Units Needed", "Capital Required (PHP)"],
      ...ledger.inventory.restockItems.map((item) => [
        `"${item.brand}"`,
        `"${item.scent_name}"`,
        item.currentStock,
        item.costPrice.toFixed(2),
        item.targetPrice.toFixed(2),
        item.unitsNeeded,
        item.capitalRequired.toFixed(2),
      ]),
      [],
      ["--- 5. BRAND CAPITAL ALLOCATION ---"],
      ["Brand", "SKUs", "Units in Stock", "Cost Value (PHP)", "Retail Value (PHP)", "Margin %", "% of Total Asset Cost"],
      ...ledger.inventory.brandAllocation.map((b) => [
        `"${b.brand}"`,
        b.skus,
        b.totalUnits,
        b.costValue.toFixed(2),
        b.retailValue.toFixed(2),
        `${b.marginPct}%`,
        `${b.shareOfCostPct}%`,
      ]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rivera-financial-audit-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Executive Financial Ledger CSV downloaded.");
  }, [ledger]);

  return (
    <div className="space-y-6">
      {/* ── Top Header Actions Bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f9d976]/20 via-[#e1b854]/30 to-amber-500/20 text-[#e1b854] border border-[#e1b854]/40 shadow-lg shadow-[#e1b854]/10">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-light text-foreground">
                Executive AI <span className="text-[#e1b854] italic">Accountant</span>
              </h2>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-emerald-400">
                Live Audit Active
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-body">
              Zero-hallucination inventory bookkeeping, margin auditing, and receivables reconciliation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshData && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshData}
              className="h-8 gap-1.5 text-xs font-mono uppercase tracking-wider border-white/10 hover:border-[#e1b854]/40 bg-white/5"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#e1b854]" />
              <span className="hidden sm:inline">Sync DB</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 gap-1.5 text-xs font-mono uppercase tracking-wider border-white/10 hover:border-emerald-500/40 bg-white/5 text-emerald-400"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export Ledger CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setApiKeyModalOpen(true)}
            className="h-8 gap-1.5 text-xs font-mono uppercase tracking-wider border-white/10 hover:border-[#e1b854]/40 bg-white/5 text-white/80"
          >
            <Key className="h-3.5 w-3.5 text-[#e1b854]" />
            <span className="hidden sm:inline">API Key</span>
          </Button>
        </div>
      </div>

      {/* ── 1. Executive Financial Bento (Double-Bezel Architecture) ──────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Inventory Asset Value */}
        <div className="rounded-[1.5rem] p-1 bg-white/[0.03] border border-white/10 ring-1 ring-white/5 shadow-xl">
          <div className="rounded-[calc(1.5rem-0.25rem)] bg-card/80 p-5 backdrop-blur-xl border border-white/5 relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Inventory Assets (Cost)
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Package className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-light text-foreground tabular-nums">
                {formatPhp(ledger.inventory.costValue)}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-body">
                <span>{ledger.inventory.totalUnits} bottles in stock</span>
                <span className="text-emerald-400 font-mono">{ledger.inventory.totalSKUs} SKUs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Target Retail Potential */}
        <div className="rounded-[1.5rem] p-1 bg-white/[0.03] border border-white/10 ring-1 ring-white/5 shadow-xl">
          <div className="rounded-[calc(1.5rem-0.25rem)] bg-card/80 p-5 backdrop-blur-xl border border-white/5 relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Retail Potential
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e1b854]/10 text-[#e1b854] border border-[#e1b854]/20">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-light text-foreground tabular-nums">
                {formatPhp(ledger.inventory.retailValue)}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-body">
                <span>Unrealized Gross Margin</span>
                <span className="text-[#e1b854] font-mono font-medium">
                  {ledger.inventory.projectedMarginPct}% ({formatPhp(ledger.inventory.projectedGrossProfit)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Realized Gross Profit */}
        <div className="rounded-[1.5rem] p-1 bg-white/[0.03] border border-white/10 ring-1 ring-white/5 shadow-xl">
          <div className="rounded-[calc(1.5rem-0.25rem)] bg-card/80 p-5 backdrop-blur-xl border border-white/5 relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Realized Gross Profit
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-light text-foreground tabular-nums text-emerald-400">
                {formatPhp(ledger.sales.totalGrossProfit)}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-body">
                <span>Turnover: {formatPhp(ledger.sales.totalRevenue)}</span>
                <span className="text-emerald-400 font-mono font-medium">{ledger.sales.grossMarginPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Receivables & Restock Budget */}
        <div className="rounded-[1.5rem] p-1 bg-white/[0.03] border border-white/10 ring-1 ring-white/5 shadow-xl">
          <div className="rounded-[calc(1.5rem-0.25rem)] bg-card/80 p-5 backdrop-blur-xl border border-white/5 relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Pending Receivables
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-light text-amber-300 tabular-nums">
                {formatPhp(ledger.orders.pendingReceivables)}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-body">
                <span>{ledger.orders.pendingCount} orders awaiting proof</span>
                <span className="text-amber-400 font-mono font-medium">
                  Restock: {formatPhp(ledger.inventory.restockCapitalNeeded)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. One-Touch Quick Audit Action Pills ──────────────────────────── */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-[#e1b854]" />
          Instant Executive Audits
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() =>
              handleSendMessage(
                "Please generate our complete Monthly Profit & Loss Statement (P&L) with realized turnover, direct fragrance COGS, gross margin percentage, and senior accountant commentary.",
                "pnl"
              )
            }
            className="h-8 rounded-full border-white/10 bg-white/5 text-xs hover:border-[#e1b854]/40 hover:bg-[#e1b854]/10 transition-all font-body text-white/90"
          >
            📊 Monthly P&amp;L Statement
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() =>
              handleSendMessage(
                "Audit our critical low-stock fragrances (2 units or fewer) and calculate the exact wholesale replenishment working capital needed to bring each to safety buffer stock.",
                "restock"
              )
            }
            className="h-8 rounded-full border-white/10 bg-white/5 text-xs hover:border-amber-500/40 hover:bg-amber-500/10 transition-all font-body text-white/90"
          >
            ⚠️ Restock Capital Forecast
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() =>
              handleSendMessage(
                "Reconcile our pending customer orders and accounts receivable. How much cash flow is waiting in unverified GCash/Bank transfers, and what are the verification action items?",
                "receivables"
              )
            }
            className="h-8 rounded-full border-white/10 bg-white/5 text-xs hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all font-body text-white/90"
          >
            💵 Reconcile Receivables
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() =>
              handleSendMessage(
                "Break down our inventory capital allocation across all fragrance houses (Rasasi, French Avenue, Armaf, Lattafa, etc.). Where is our capital most heavily concentrated?",
                "inventory"
              )
            }
            className="h-8 rounded-full border-white/10 bg-white/5 text-xs hover:border-primary/40 hover:bg-primary/10 transition-all font-body text-white/90"
          >
            🏷️ Brand Capital Allocation
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() =>
              handleSendMessage(
                "Rank our top profit-generating fragrances by total realized peso profit and profit margin percentage. Which perfumes are our highest margin champions?",
                "pnl"
              )
            }
            className="h-8 rounded-full border-white/10 bg-white/5 text-xs hover:border-rose-400/40 hover:bg-rose-400/10 transition-all font-body text-white/90"
          >
            🏆 Top Margin Champions
          </Button>
        </div>
      </div>

      {/* ── 3. Conversational Accountant Workspace ────────────────────────── */}
      <Card className="rounded-[1.5rem] border-white/10 bg-card/70 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] relative">
        {/* Chat message stream */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground border-primary/40"
                    : "bg-white/5 text-[#e1b854] border-white/10"
                }`}
              >
                {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message body */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm font-body leading-relaxed shadow-lg ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-white/[0.04] text-foreground border border-white/10"
                }`}
              >
                {/* Header tag */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-white/5 text-[10px] font-mono text-muted-foreground">
                  <span>{msg.sender === "user" ? "You (Admin)" : "Senior Accountant (AI)"}</span>
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && (
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-[#e1b854] border border-[#e1b854]/20">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Render formatted message content */}
                <div className="prose prose-invert prose-xs sm:prose-sm max-w-none space-y-2 [&_h3]:font-display [&_h3]:text-base [&_h3]:text-[#e1b854] [&_h4]:font-display [&_h4]:text-sm [&_h4]:text-white [&_table]:w-full [&_table]:border [&_table]:border-white/10 [&_table]:rounded-lg [&_table]:overflow-hidden [&_th]:bg-white/10 [&_th]:text-[#e1b854] [&_th]:p-2.5 [&_th]:font-mono [&_th]:text-[11px] [&_td]:p-2 [&_td]:border-t [&_td]:border-white/5 [&_td]:font-body [&_strong]:text-white">
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#e1b854] border border-white/10">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-xs font-mono text-muted-foreground flex items-center gap-3">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#e1b854]" />
                <span>Auditing live database ledgers and calculating margins...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input form */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI Accountant (e.g. 'What is our profit margin on Hawas?', 'Audit dead stock')..."
              disabled={loading}
              className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#e1b854]/60 transition-all font-body"
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-full h-11 w-11 p-0 flex items-center justify-center bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all shrink-0 cursor-pointer disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground px-2 font-mono">
            <span>Powered by Google Gemini 100% Free Tier &amp; Deterministic CPA Math</span>
            <span>Zero Arithmetic Hallucinations</span>
          </div>
        </div>
      </Card>

      {/* ── 4. API Key Configuration Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {apiKeyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-card p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(false)}
                className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e1b854]/10 text-[#e1b854] border border-[#e1b854]/30">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">Gemini API Key</h3>
                  <span className="text-[10px] font-mono uppercase text-emerald-400">100% Free Forever</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground font-body leading-relaxed mb-4">
                Google AI Studio provides a free API key with 1,500 requests per day and zero credit card required. You can also configure it in your <code className="text-[#e1b854]">.env.local</code> as <code className="text-[#e1b854]">GEMINI_API_KEY</code>.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="Enter or paste your Gemini API key..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-[#e1b854]"
                  />
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-muted-foreground font-body space-y-1">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Free Tier Limits</span>
                  </div>
                  <p>15 requests/minute &bull; 1,500 queries/day &bull; 1M token context.</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setApiKeyModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveApiKey}
                    className="bg-[#e1b854] text-black hover:bg-white text-xs font-semibold"
                  >
                    Save Key
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
