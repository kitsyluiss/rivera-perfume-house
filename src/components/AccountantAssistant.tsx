"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  User,
  Building2,
  X,
  FileText,
  AlertCircle,
  Receipt,
  Layers,
  Award,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  ArrowDown,
  LogOut,
  Globe,
  ShieldAlert,
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
      text: `### Executive Financial Controller & Accountant

Live inventory valuation, exact profit and loss margins, pending customer receivables, and restock capital requirements.

**Live Financial Balance Sheet:**
- **Inventory Capital Invested (At Cost):** **${formatPhp(ledger.inventory.costValue)}** (${ledger.inventory.totalUnits} bottles)
- **Target Retail Potential:** **${formatPhp(ledger.inventory.retailValue)}** (**${ledger.inventory.projectedMarginPct}%** projected margin)
- **Realized Gross Profit:** **${formatPhp(ledger.sales.totalGrossProfit)}** (**${ledger.sales.grossMarginPct}%** realized margin)
- **Pending Receivables:** **${formatPhp(ledger.orders.pendingReceivables)}** across ${ledger.orders.pendingCount} unverified orders

*Select any audit action below or enter a question regarding bookkeeping, P&L statements, margins, or reorder budgets.*`,
      timestamp: new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
      modelUsed: "gemini-2.5-flash-lite",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [sheetsModalOpen, setSheetsModalOpen] = useState(false);
  const [sheetsWebhookUrl, setSheetsWebhookUrl] = useState("");
  const [sheetsSyncing, setSheetsSyncing] = useState(false);
  const [sheetsCopied, setSheetsCopied] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [appsScriptCode, setAppsScriptCode] = useState<string>("");
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [oauthConnected, setOauthConnected] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthSpreadsheetId, setOauthSpreadsheetId] = useState("");
  const [oauthSpreadsheetUrl, setOauthSpreadsheetUrl] = useState<string | null>(null);
  const [activeSheetsMode, setActiveSheetsMode] = useState<"oauth" | "webhook">("oauth");
  const [copiedRedirectUri, setCopiedRedirectUri] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Recalculate local ledger when props change
  useEffect(() => {
    const updated = calculateFinancialLedger(perfumes, sales, orders);
    setLedger(updated);
  }, [perfumes, sales, orders]);

  // Load custom key & Google Sheets settings from localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("rivera_gemini_api_key");
      if (savedKey) setCustomApiKey(savedKey);
      const savedWebhook = localStorage.getItem("rivera_sheets_webhook_url");
      if (savedWebhook) setSheetsWebhookUrl(savedWebhook);
      const savedSync = localStorage.getItem("rivera_sheets_last_synced");
      if (savedSync) setLastSyncedAt(savedSync);
      const savedOauthId = localStorage.getItem("rivera_sheets_oauth_id");
      if (savedOauthId) {
        setOauthSpreadsheetId(savedOauthId);
        setOauthSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${savedOauthId}/edit`);
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const checkOAuthStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/accountant/sheets-oauth/status");
      const data = await res.json();
      if (data?.connected) {
        setOauthConnected(true);
      }
    } catch {}
  }, []);

  // Check OAuth callback state on mount
  useEffect(() => {
    checkOAuthStatus();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("oauth") === "success") {
        toast.success("Google Account successfully connected! You can now sync directly.");
        setOauthConnected(true);
        setSheetsModalOpen(true);
        setActiveSheetsMode("oauth");
        const url = new URL(window.location.href);
        url.searchParams.delete("oauth");
        window.history.replaceState({}, document.title, url.toString());
      } else if (params.get("oauth_error")) {
        const err = params.get("oauth_error");
        toast.error(`OAuth error: ${err}. Ensure your Google email is added to Test Users in Google Cloud Console.`);
        setSheetsModalOpen(true);
        setActiveSheetsMode("oauth");
        const url = new URL(window.location.href);
        url.searchParams.delete("oauth_error");
        window.history.replaceState({}, document.title, url.toString());
      }
    }
  }, [checkOAuthStatus]);

  // Fetch the Google Apps Script template code
  const loadAppsScriptCode = useCallback(async () => {
    if (appsScriptCode) return;
    try {
      const res = await fetch("/api/admin/accountant/sheets-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_script" }),
      });
      const data = await res.json();
      if (data?.script) setAppsScriptCode(data.script);
    } catch (err) {
      console.error("Failed to load Apps Script template", err);
    }
  }, [appsScriptCode]);

  // Track user scroll position so scrolling up is never blocked
  const handleChatScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setUserScrolledUp(distanceFromBottom > 80);
  };

  const scrollToBottom = (smooth = true) => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
      setUserScrolledUp(false);
    }
  };

  // Only auto-scroll down if user is at the bottom
  useEffect(() => {
    if (!userScrolledUp && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, loading, userScrolledUp]);

  const handleSaveApiKey = () => {
    try {
      localStorage.setItem("rivera_gemini_api_key", customApiKey.trim());
      toast.success("Gemini API key saved locally in your browser.");
      setApiKeyModalOpen(false);
    } catch {
      toast.error("Failed to save API key to local storage.");
    }
  };

  const handleOAuthConnect = () => {
    window.location.href = "/api/admin/accountant/sheets-oauth/authorize";
  };

  const handleOAuthDisconnect = async () => {
    try {
      await fetch("/api/admin/accountant/sheets-oauth/disconnect", { method: "POST" });
      setOauthConnected(false);
      setOauthSpreadsheetUrl(null);
      toast.success("Google Account disconnected.");
    } catch {
      toast.error("Failed to disconnect Google Account.");
    }
  };

  const handleOAuthSync = async () => {
    setOauthLoading(true);
    try {
      const res = await fetch("/api/admin/accountant/sheets-oauth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetId: oauthSpreadsheetId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "OAuth Sync failed");
      }

      if (data.spreadsheetId) {
        setOauthSpreadsheetId(data.spreadsheetId);
        try {
          localStorage.setItem("rivera_sheets_oauth_id", data.spreadsheetId);
        } catch {}
      }
      if (data.spreadsheetUrl) {
        setOauthSpreadsheetUrl(data.spreadsheetUrl);
      }

      const timestamp = new Date().toLocaleString("en-PH");
      setLastSyncedAt(timestamp);
      try {
        localStorage.setItem("rivera_sheets_last_synced", timestamp);
      } catch {}

      toast.success("Google Sheets synchronized! 4 tabs updated with live financial records.");
    } catch (err: any) {
      toast.error(err?.message || "Sync failed. Ensure Google Sheets API v4 is enabled in Google Cloud Console.");
    } finally {
      setOauthLoading(false);
    }
  };

  const handleSyncGoogleSheets = async () => {
    if (!sheetsWebhookUrl.trim()) {
      toast.error("Please enter your Google Apps Script Webhook URL.");
      return;
    }

    setSheetsSyncing(true);
    try {
      const res = await fetch("/api/admin/accountant/sheets-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: sheetsWebhookUrl.trim(), action: "sync" }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to sync to Google Sheets");
      }

      try {
        localStorage.setItem("rivera_sheets_webhook_url", sheetsWebhookUrl.trim());
        const timestamp = new Date().toLocaleString("en-PH");
        localStorage.setItem("rivera_sheets_last_synced", timestamp);
        setLastSyncedAt(timestamp);
      } catch {}

      toast.success("Google Sheets synchronized! 4 tabs updated with live financial records.");
    } catch (err: any) {
      toast.error(err?.message || "Sync failed. Please verify the Webhook URL.");
    } finally {
      setSheetsSyncing(false);
    }
  };

  const handleCopyScript = () => {
    if (!appsScriptCode) return;
    navigator.clipboard.writeText(appsScriptCode);
    setSheetsCopied(true);
    toast.success("Apps Script code copied to clipboard!");
    setTimeout(() => setSheetsCopied(false), 2500);
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
    setUserScrolledUp(false);
    setTimeout(() => {
      scrollToBottom(true);
    }, 50);

    try {
      const res = await fetch("/api/admin/accountant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          apiKey: customApiKey.trim() || undefined,
          action: "chat",
          queryType,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
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
          text: `**Audit Alert**: We encountered an issue connecting to the AI model (${err?.message}). Database values remain intact. Please verify network connectivity or check your Gemini API key in settings.`,
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
            onClick={() => {
              setSheetsModalOpen(true);
              loadAppsScriptCode();
            }}
            className="h-8 gap-1.5 text-xs font-mono uppercase tracking-wider border-white/10 hover:border-emerald-500/40 bg-white/5 text-emerald-300"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Google Sheets</span>
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

      {/* ── 2. One-Touch Quick Audit Action Pills (No Emojis) ─────────────── */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
          <FileText className="h-3 w-3 text-[#e1b854]" />
          Executive Financial Audits
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
            className="h-8 rounded-full border-white/10 bg-white/5 text-xs hover:border-[#e1b854]/40 hover:bg-[#e1b854]/10 transition-all font-body text-white/90 gap-1.5"
          >
            <FileText className="h-3 w-3 text-[#e1b854]" />
            <span>Monthly P&amp;L Statement</span>
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
            className="h-8 rounded-full border-white/10 bg-white/5 text-xs hover:border-amber-500/40 hover:bg-amber-500/10 transition-all font-body text-white/90 gap-1.5"
          >
            <AlertCircle className="h-3 w-3 text-amber-400" />
            <span>Restock Capital Forecast</span>
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
            className="h-8 rounded-full border-white/10 bg-white/5 text-xs hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all font-body text-white/90 gap-1.5"
          >
            <Receipt className="h-3 w-3 text-emerald-400" />
            <span>Reconcile Receivables</span>
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
            className="h-8 rounded-full border-white/10 bg-white/5 text-xs hover:border-primary/40 hover:bg-primary/10 transition-all font-body text-white/90 gap-1.5"
          >
            <Layers className="h-3 w-3 text-primary" />
            <span>Brand Capital Allocation</span>
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
            className="h-8 rounded-full border-white/10 bg-white/5 text-xs hover:border-rose-400/40 hover:bg-rose-400/10 transition-all font-body text-white/90 gap-1.5"
          >
            <Award className="h-3 w-3 text-rose-400" />
            <span>Top Margin Champions</span>
          </Button>
        </div>
      </div>

      {/* ── 3. Conversational Accountant Workspace ────────────────────────── */}
      <Card className="rounded-[1.5rem] border-white/10 bg-card/70 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] relative">
        {/* Chat message stream */}
        <div
          ref={chatScrollRef}
          onScroll={handleChatScroll}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 scroll-smooth"
        >
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
                {msg.sender === "user" ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
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
                <div className="flex items-center justify-between gap-4 mb-2.5 pb-1.5 border-b border-white/5 text-[10px] font-mono text-muted-foreground">
                  <span className="font-medium text-white/70">
                    {msg.sender === "user" ? "You (Admin)" : "Senior Accountant"}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && (
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-[#e1b854] border border-[#e1b854]/20">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Render fully formatted Markdown with GFM tables and custom luxury styling */}
                <div className="prose prose-invert prose-xs sm:prose-sm max-w-none text-xs sm:text-sm font-body leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="font-display text-lg font-light text-white mt-4 mb-2 tracking-wide border-b border-white/5 pb-1">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-display text-base font-light text-white mt-3.5 mb-2 tracking-wide">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-display text-sm font-medium text-[#e1b854] mt-3 mb-1.5 tracking-wide">
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="font-display text-xs font-semibold text-white/90 mt-2.5 mb-1 tracking-wider uppercase">
                          {children}
                        </h4>
                      ),
                      p: ({ children }) => (
                        <p className="mb-2 leading-relaxed text-white/85 last:mb-0">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-white">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-white/70">
                          {children}
                        </em>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-2.5 space-y-1 list-disc list-inside text-white/80 marker:text-[#e1b854]">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="my-2.5 space-y-1 list-decimal list-inside text-white/80 marker:text-[#e1b854]">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">
                          {children}
                        </li>
                      ),
                      hr: () => (
                        <hr className="my-3 border-white/10" />
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-[#e1b854]/60 pl-3 my-2 text-white/70 italic text-xs">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-3 rounded-xl border border-white/10 bg-black/40 shadow-inner">
                          <table className="w-full text-left border-collapse text-xs font-mono">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-white/5 text-[#e1b854] uppercase tracking-wider text-[10px] border-b border-white/10">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="p-2.5 font-medium whitespace-nowrap">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="p-2.5 border-t border-white/5 tabular-nums text-white/85">
                          {children}
                        </td>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-mono text-[#e1b854]">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
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
                <Building2 className="h-4 w-4 animate-pulse" />
              </div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-xs font-mono text-muted-foreground flex items-center gap-3">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#e1b854]" />
                <span>Auditing live database ledgers and calculating margins...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating scroll-to-latest button */}
        {userScrolledUp && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-24 right-6 z-20 flex items-center gap-1.5 rounded-full bg-[#e1b854] text-black px-3.5 py-1.5 text-xs font-mono font-semibold shadow-2xl hover:bg-white transition-all cursor-pointer border border-black/20"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            <span>Scroll to latest</span>
          </button>
        )}

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
            <span>Powered by Google Gemini Free Tier &amp; Deterministic CPA Math</span>
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

      {/* ── 5. Google Sheets Sync Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {sheetsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-card p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setSheetsModalOpen(false)}
                className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">Google Sheets Synchronization</h3>
                  <span className="text-[10px] font-mono uppercase text-emerald-400">
                    Live 4-Tab Ledger Sync &bull; Official Google Sheets API v4
                  </span>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveSheetsMode("oauth")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-all ${
                    activeSheetsMode === "oauth"
                      ? "bg-[#e1b854] text-black font-semibold shadow-md"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  Google OAuth 2.0 (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSheetsMode("webhook")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-all ${
                    activeSheetsMode === "webhook"
                      ? "bg-[#e1b854] text-black font-semibold shadow-md"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  Apps Script Webhook
                </button>
              </div>

              {/* ── TAB 1: GOOGLE OAUTH 2.0 ──────────────────────────────────── */}
              {activeSheetsMode === "oauth" && (
                <div className="space-y-4">
                  {/* Connection Card */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                        Google Account Connection
                      </span>
                      {oauthConnected ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                          </span>
                          <button
                            type="button"
                            onClick={handleOAuthDisconnect}
                            className="text-[10px] font-mono text-rose-400 hover:text-rose-300 underline"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          Not Connected
                        </span>
                      )}
                    </div>

                    {!oauthConnected ? (
                      <Button
                        type="button"
                        onClick={handleOAuthConnect}
                        className="w-full bg-white hover:bg-white/90 text-black font-semibold text-xs h-11 gap-2 shadow-lg"
                      >
                        <Globe className="h-4 w-4 text-emerald-600" />
                        <span>Connect Google Account via OAuth</span>
                      </Button>
                    ) : (
                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                            Google Spreadsheet ID (Optional)
                          </label>
                          <input
                            type="text"
                            value={oauthSpreadsheetId}
                            onChange={(e) => setOauthSpreadsheetId(e.target.value)}
                            placeholder="Leave empty to auto-create 'Rivera Fragrance House — Financial Ledger'"
                            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-emerald-400 placeholder:text-muted-foreground/60"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          {lastSyncedAt && (
                            <span className="text-[10px] font-mono text-emerald-400">
                              Last synced: {lastSyncedAt}
                            </span>
                          )}
                          <Button
                            type="button"
                            disabled={oauthLoading}
                            onClick={handleOAuthSync}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs h-10 px-5 ml-auto gap-1.5"
                          >
                            {oauthLoading ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Syncing to Google Sheets...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>Sync to Google Sheet (OAuth)</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {oauthSpreadsheetUrl && (
                      <a
                        href={oauthSpreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all font-body text-xs mt-2"
                      >
                        <span className="font-medium">Open Synchronized Google Sheet in New Tab</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  {/* Required GCP Console Configuration Box */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                    <div className="flex items-center gap-2 text-white font-medium text-xs">
                      <Key className="h-4 w-4 text-[#e1b854]" />
                      <span>Google Cloud Console Configuration Checklist</span>
                    </div>

                    <div className="space-y-2 text-xs font-body text-muted-foreground leading-relaxed">
                      {/* Redirect URIs */}
                      <div>
                        <span className="text-white/90 font-medium block mb-1">
                          1. Add Authorized Redirect URI (in your OAuth client dialog):
                        </span>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-[10px] text-[#e1b854]">
                            <span className="truncate">https://rivera.perfumehouse.workers.dev/api/admin/accountant/sheets-oauth/callback</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText("https://rivera.perfumehouse.workers.dev/api/admin/accountant/sheets-oauth/callback");
                                setCopiedRedirectUri("prod");
                                toast.success("Production Redirect URI copied!");
                                setTimeout(() => setCopiedRedirectUri(null), 2000);
                              }}
                              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white shrink-0 flex items-center gap-1"
                            >
                              {copiedRedirectUri === "prod" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              <span>{copiedRedirectUri === "prod" ? "Copied" : "Copy"}</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-[10px] text-white/70">
                            <span className="truncate">http://localhost:3001/api/admin/accountant/sheets-oauth/callback</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText("http://localhost:3001/api/admin/accountant/sheets-oauth/callback");
                                setCopiedRedirectUri("local");
                                toast.success("Localhost Redirect URI copied!");
                                setTimeout(() => setCopiedRedirectUri(null), 2000);
                              }}
                              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white shrink-0 flex items-center gap-1"
                            >
                              {copiedRedirectUri === "local" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              <span>{copiedRedirectUri === "local" ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Test Users Warning from Screenshot */}
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-amber-300">
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                          <span>Important: Add Test Users in OAuth Consent Screen</span>
                        </div>
                        <p>
                          As noted in your screenshot, Google restricts access to <strong>Test users</strong>. You must go to{" "}
                          <strong className="text-white">Google Cloud Console &gt; APIs &amp; Services &gt; OAuth consent screen &gt; Test users</strong>{" "}
                          and click <strong className="text-white">+ ADD USERS</strong> with your Google email. Otherwise Google returns <code>Error 403: access_denied</code>.
                        </p>
                      </div>

                      {/* Enabled APIs */}
                      <div className="text-[11px] text-white/70">
                        <strong className="text-white">APIs to enable:</strong> In Google Cloud Console, ensure both{" "}
                        <span className="text-[#e1b854]">Google Sheets API v4</span> (<code>sheets.googleapis.com</code>) and{" "}
                        <span className="text-[#e1b854]">Google Drive API v3</span> (<code>drive.googleapis.com</code>) are enabled.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: APPS SCRIPT WEBHOOK ───────────────────────────────── */}
              {activeSheetsMode === "webhook" && (
                <div className="space-y-4">
                  {/* Sync Action Card */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                        Google Apps Script Webhook URL
                      </label>
                      {lastSyncedAt && (
                        <span className="text-[10px] font-mono text-emerald-400">
                          Last synced: {lastSyncedAt}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={sheetsWebhookUrl}
                        onChange={(e) => setSheetsWebhookUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-emerald-400 placeholder:text-muted-foreground/60"
                      />
                      <Button
                        size="sm"
                        disabled={sheetsSyncing || !sheetsWebhookUrl.trim()}
                        onClick={handleSyncGoogleSheets}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs h-10 px-4 shrink-0 gap-1.5"
                      >
                        {sheetsSyncing ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Syncing...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Sync to Sheet</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Step-by-Step Setup Guide */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#e1b854] flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Apps Script Setup Instructions
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyScript}
                        className="h-7 text-xs font-mono text-[#e1b854] hover:bg-[#e1b854]/10 gap-1"
                      >
                        {sheetsCopied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Script</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <ol className="text-xs text-muted-foreground font-body space-y-2 list-decimal list-inside leading-relaxed">
                      <li>
                        Open a spreadsheet on{" "}
                        <a
                          href="https://sheets.new"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#e1b854] underline inline-flex items-center gap-1"
                        >
                          Google Sheets (sheets.new)
                          <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      </li>
                      <li>Click <strong className="text-white">Extensions &gt; Apps Script</strong>.</li>
                      <li>Replace the code in <code className="text-[#e1b854]">Code.gs</code> with the script (click <strong>Copy Script</strong> above).</li>
                      <li>
                        Click <strong className="text-white">Deploy &gt; New deployment &gt; Web app</strong>:
                        <ul className="list-disc list-inside ml-4 mt-1 text-[11px]">
                          <li>Execute as: <strong className="text-white">Me</strong></li>
                          <li>Who has access: <strong className="text-white">Anyone</strong></li>
                        </ul>
                      </li>
                      <li>Copy the <strong className="text-white">Web app URL</strong> and paste it into the box above.</li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSheetsModalOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
