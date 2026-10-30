import { Perfume, Sale, Order } from "@/lib/types";

export interface BrandAllocation {
  brand: string;
  skus: number;
  totalUnits: number;
  costValue: number;
  retailValue: number;
  projectedProfit: number;
  marginPct: number;
  shareOfCostPct: number;
}

export interface PeriodSummary {
  revenue: number;
  cost: number;
  profit: number;
  marginPct: number;
  units: number;
  count: number;
}

export interface TopSeller {
  brand: string;
  scent_name: string;
  qtySold: number;
  revenue: number;
  cost: number;
  profit: number;
  marginPct: number;
}

export interface RestockItem {
  id: string;
  brand: string;
  scent_name: string;
  currentStock: number;
  costPrice: number;
  targetPrice: number;
  unitsNeeded: number;
  capitalRequired: number;
}

export interface FinancialLedger {
  timestamp: string;
  inventory: {
    totalSKUs: number;
    totalUnits: number;
    costValue: number;
    retailValue: number;
    projectedGrossProfit: number;
    projectedMarginPct: number;
    brandAllocation: BrandAllocation[];
    lowStockCount: number;
    outOfStockCount: number;
    restockCapitalNeeded: number;
    restockItems: RestockItem[];
  };
  sales: {
    totalCount: number;
    unitsSold: number;
    totalRevenue: number;
    totalCost: number;
    totalGrossProfit: number;
    grossMarginPct: number;
    averageOrderValue: number;
    today: PeriodSummary;
    thisWeek: PeriodSummary;
    thisMonth: PeriodSummary;
    topSellers: TopSeller[];
  };
  orders: {
    totalOrders: number;
    pendingCount: number;
    pendingReceivables: number;
    paidCount: number;
    paidRevenue: number;
    cancelledCount: number;
    shippingCollected: number;
  };
}

/**
 * Deterministic Financial Ledger Calculator
 * Pre-computes exact mathematical aggregations directly from DB rows.
 * Guarantees zero arithmetic hallucination.
 */
export function calculateFinancialLedger(
  perfumes: Perfume[],
  sales: Sale[],
  orders: Order[]
): FinancialLedger {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  // Start of this week (Monday)
  const dayOfWeek = now.getDay() || 7;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1).getTime();
  
  // Start of this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // 1. Inventory math
  let totalUnits = 0;
  let inventoryCost = 0;
  let inventoryRetail = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let restockCapitalNeeded = 0;
  const restockItems: RestockItem[] = [];

  const brandMap = new Map<string, { skus: number; units: number; cost: number; retail: number }>();

  for (const p of perfumes) {
    totalUnits += p.quantity;
    const cost = p.quantity * p.cost_price;
    const retail = p.quantity * p.target_sale_price;
    inventoryCost += cost;
    inventoryRetail += retail;

    const brandKey = p.brand || "Unbranded";
    const existing = brandMap.get(brandKey) || { skus: 0, units: 0, cost: 0, retail: 0 };
    existing.skus += 1;
    existing.units += p.quantity;
    existing.cost += cost;
    existing.retail += retail;
    brandMap.set(brandKey, existing);

    if (p.quantity <= 2) {
      if (p.quantity === 0) outOfStockCount += 1;
      else lowStockCount += 1;

      const unitsNeeded = Math.max(1, 5 - p.quantity);
      const capReq = unitsNeeded * p.cost_price;
      restockCapitalNeeded += capReq;

      restockItems.push({
        id: p.id,
        brand: p.brand,
        scent_name: p.scent_name,
        currentStock: p.quantity,
        costPrice: p.cost_price,
        targetPrice: p.target_sale_price,
        unitsNeeded,
        capitalRequired: capReq,
      });
    }
  }

  // Sort restock items by currentStock ascending
  restockItems.sort((a, b) => a.currentStock - b.currentStock);

  const brandAllocation: BrandAllocation[] = Array.from(brandMap.entries())
    .map(([brand, data]) => {
      const profit = data.retail - data.cost;
      const marginPct = data.retail > 0 ? (profit / data.retail) * 100 : 0;
      const shareOfCostPct = inventoryCost > 0 ? (data.cost / inventoryCost) * 100 : 0;
      return {
        brand,
        skus: data.skus,
        totalUnits: data.units,
        costValue: Math.round(data.cost * 100) / 100,
        retailValue: Math.round(data.retail * 100) / 100,
        projectedProfit: Math.round(profit * 100) / 100,
        marginPct: Math.round(marginPct * 10) / 10,
        shareOfCostPct: Math.round(shareOfCostPct * 10) / 10,
      };
    })
    .sort((a, b) => b.costValue - a.costValue);

  const projectedGrossProfit = inventoryRetail - inventoryCost;
  const projectedMarginPct = inventoryRetail > 0 ? (projectedGrossProfit / inventoryRetail) * 100 : 0;

  // 2. Sales math
  let totalRevenue = 0;
  let totalCost = 0;
  let unitsSold = 0;

  const todaySummary: PeriodSummary = { revenue: 0, cost: 0, profit: 0, marginPct: 0, units: 0, count: 0 };
  const weekSummary: PeriodSummary = { revenue: 0, cost: 0, profit: 0, marginPct: 0, units: 0, count: 0 };
  const monthSummary: PeriodSummary = { revenue: 0, cost: 0, profit: 0, marginPct: 0, units: 0, count: 0 };

  const perfumeSalesMap = new Map<string, { brand: string; scent: string; qty: number; rev: number; cost: number }>();

  for (const s of sales) {
    const saleRev = s.quantity_sold * s.unit_price;
    const saleCost = s.quantity_sold * s.cost_at_sale;
    totalRevenue += saleRev;
    totalCost += saleCost;
    unitsSold += s.quantity_sold;

    const saleTime = new Date(s.created_at).getTime();

    // Today
    if (saleTime >= todayStart) {
      todaySummary.revenue += saleRev;
      todaySummary.cost += saleCost;
      todaySummary.units += s.quantity_sold;
      todaySummary.count += 1;
    }
    // This Week
    if (saleTime >= weekStart) {
      weekSummary.revenue += saleRev;
      weekSummary.cost += saleCost;
      weekSummary.units += s.quantity_sold;
      weekSummary.count += 1;
    }
    // This Month
    if (saleTime >= monthStart) {
      monthSummary.revenue += saleRev;
      monthSummary.cost += saleCost;
      monthSummary.units += s.quantity_sold;
      monthSummary.count += 1;
    }

    // Top sellers map
    const key = `${s.brand || ""}||${s.scent_name || ""}`;
    const cur = perfumeSalesMap.get(key) || {
      brand: s.brand || "Perfume",
      scent: s.scent_name || "Scent",
      qty: 0,
      rev: 0,
      cost: 0,
    };
    cur.qty += s.quantity_sold;
    cur.rev += saleRev;
    cur.cost += saleCost;
    perfumeSalesMap.set(key, cur);
  }

  // Calculate period margins
  const finalizePeriod = (p: PeriodSummary) => {
    p.profit = p.revenue - p.cost;
    p.marginPct = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
    p.revenue = Math.round(p.revenue * 100) / 100;
    p.cost = Math.round(p.cost * 100) / 100;
    p.profit = Math.round(p.profit * 100) / 100;
    p.marginPct = Math.round(p.marginPct * 10) / 10;
  };
  finalizePeriod(todaySummary);
  finalizePeriod(weekSummary);
  finalizePeriod(monthSummary);

  const totalGrossProfit = totalRevenue - totalCost;
  const grossMarginPct = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  const topSellers: TopSeller[] = Array.from(perfumeSalesMap.values())
    .map((item) => {
      const profit = item.rev - item.cost;
      const margin = item.rev > 0 ? (profit / item.rev) * 100 : 0;
      return {
        brand: item.brand,
        scent_name: item.scent,
        qtySold: item.qty,
        revenue: Math.round(item.rev * 100) / 100,
        cost: Math.round(item.cost * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        marginPct: Math.round(margin * 10) / 10,
      };
    })
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);

  // 3. Orders math
  let pendingCount = 0;
  let pendingReceivables = 0;
  let paidCount = 0;
  let paidRevenue = 0;
  let cancelledCount = 0;
  let shippingCollected = 0;

  for (const o of orders) {
    if (o.status === "pending_verification") {
      pendingCount += 1;
      pendingReceivables += o.total;
    } else if (["paid", "shipped", "delivered"].includes(o.status)) {
      paidCount += 1;
      paidRevenue += o.total;
      shippingCollected += o.shipping_fee || 0;
    } else if (o.status === "cancelled") {
      cancelledCount += 1;
    }
  }

  return {
    timestamp: now.toISOString(),
    inventory: {
      totalSKUs: perfumes.length,
      totalUnits,
      costValue: Math.round(inventoryCost * 100) / 100,
      retailValue: Math.round(inventoryRetail * 100) / 100,
      projectedGrossProfit: Math.round(projectedGrossProfit * 100) / 100,
      projectedMarginPct: Math.round(projectedMarginPct * 10) / 10,
      brandAllocation,
      lowStockCount,
      outOfStockCount,
      restockCapitalNeeded: Math.round(restockCapitalNeeded * 100) / 100,
      restockItems,
    },
    sales: {
      totalCount: sales.length,
      unitsSold,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      totalGrossProfit: Math.round(totalGrossProfit * 100) / 100,
      grossMarginPct: Math.round(grossMarginPct * 10) / 10,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      today: todaySummary,
      thisWeek: weekSummary,
      thisMonth: monthSummary,
      topSellers,
    },
    orders: {
      totalOrders: orders.length,
      pendingCount,
      pendingReceivables: Math.round(pendingReceivables * 100) / 100,
      paidCount,
      paidRevenue: Math.round(paidRevenue * 100) / 100,
      cancelledCount,
      shippingCollected: Math.round(shippingCollected * 100) / 100,
    },
  };
}

/**
 * Constructs the strictly grounded, zero-hallucination system prompt for Gemini
 */
export function buildAccountantSystemPrompt(ledger: FinancialLedger): string {
  const php = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const brandSummaryText = ledger.inventory.brandAllocation
    .slice(0, 6)
    .map(
      (b) =>
        `- **${b.brand}**: ${b.totalUnits} bottles | Cost: ${php(b.costValue)} (${b.shareOfCostPct}% of capital) | Retail: ${php(b.retailValue)} | Margin: ${b.marginPct}%`
    )
    .join("\n");

  const lowStockText = ledger.inventory.restockItems
    .slice(0, 8)
    .map(
      (item) =>
        `- ${item.brand} - ${item.scent_name}: ${item.currentStock} in stock (Unit Cost: ${php(item.costPrice)}, Need: +${item.unitsNeeded} units, Restock Cost: ${php(item.capitalRequired)})`
    )
    .join("\n");

  const topSellersText = ledger.sales.topSellers
    .slice(0, 5)
    .map(
      (t) =>
        `- ${t.brand} - ${t.scent_name}: ${t.qtySold} sold | Rev: ${php(t.revenue)} | Profit: ${php(t.profit)} (${t.marginPct}% margin)`
    )
    .join("\n");

  return `You are the Chief Financial Officer (CFO) and Senior Accountant for Rivera Fragrance House, a boutique perfumery and direct fragrance importer located in Malabon, Metro Manila, Philippines.

### CRITICAL ANTI-HALLUCINATION RULES:
1. All financial numbers provided below are PRE-COMPUTED AND EXACT from the live PostgreSQL database.
2. You MUST NEVER fabricate, guess, or modify these figures. Quote these numbers verbatim.
3. Currency is strictly Philippine Peso (PHP, ₱).
4. Use clean Markdown tables, crisp bullet points, and authoritative, respectful executive tone.
5. Provide actionable managerial commentary (cash flow safety, margin health, reorder priorities).

### LIVE FINANCIAL BALANCE SHEET (VERIFIED AS OF ${new Date(ledger.timestamp).toLocaleString("en-PH")}):
- **Inventory Capital Invested (Asset at Cost)**: ${php(ledger.inventory.costValue)} (${ledger.inventory.totalUnits} physical bottles across ${ledger.inventory.totalSKUs} SKUs)
- **Target Retail Liquidation Potential**: ${php(ledger.inventory.retailValue)}
- **Projected Unrealized Gross Margin**: ${php(ledger.inventory.projectedGrossProfit)} (${ledger.inventory.projectedMarginPct}% margin)
- **Restock Working Capital Needed**: ${php(ledger.inventory.restockCapitalNeeded)} (${ledger.inventory.lowStockCount + ledger.inventory.outOfStockCount} critical/out-of-stock items)

### REALIZED HISTORICAL SALES (INCOME STATEMENT):
- **Gross Sales Turnover**: ${php(ledger.sales.totalRevenue)} (${ledger.sales.unitsSold} units liquidated across ${ledger.sales.totalCount} sales)
- **Realized Cost of Goods Sold (COGS)**: ${php(ledger.sales.totalCost)}
- **Realized Gross Profit**: ${php(ledger.sales.totalGrossProfit)}
- **Overall Realized Gross Margin**: ${ledger.sales.grossMarginPct}%
- **Average Order Value (AOV)**: ${php(ledger.sales.averageOrderValue)}

### PERIOD BREAKDOWN:
- **Today**: Revenue: ${php(ledger.sales.today.revenue)} | COGS: ${php(ledger.sales.today.cost)} | Profit: ${php(ledger.sales.today.profit)} (${ledger.sales.today.units} units)
- **This Week**: Revenue: ${php(ledger.sales.thisWeek.revenue)} | Profit: ${php(ledger.sales.thisWeek.profit)} (${ledger.sales.thisWeek.units} units)
- **This Month**: Revenue: ${php(ledger.sales.thisMonth.revenue)} | Profit: ${php(ledger.sales.thisMonth.profit)} (${ledger.sales.thisMonth.units} units)

### ORDER CASH FLOW & RECEIVABLES:
- **Pending Verification Receivables**: ${php(ledger.orders.pendingReceivables)} across ${ledger.orders.pendingCount} customer orders awaiting GCash/bank verification.
- **Settled Online Order Revenue**: ${php(ledger.orders.paidRevenue)} across ${ledger.orders.paidCount} fulfilled orders.
- **Pass-through Shipping Collected**: ${php(ledger.orders.shippingCollected)}

### TOP PROFIT-GENERATING PERFUMES:
${topSellersText || "No recorded sales yet."}

### BRAND CAPITAL ALLOCATION:
${brandSummaryText || "No inventory tracked."}

### LOW-STOCK CRITICAL AUDIT:
${lowStockText || "All inventory levels healthy (above 2 units)."}

Whenever asked for a P&L, stock audit, restock forecast, or receivables check, follow the official Rivera Fragrance House reporting format with tables, bold totals, and senior accountant commentary.`;
}

/**
 * Resilient multi-model Gemini API caller with zero heavy dependencies
 */
export async function queryGeminiAccountant(
  userPrompt: string,
  systemPrompt: string,
  apiKey: string
): Promise<{ text: string; modelUsed: string }> {
  // Ordered fallback models
  const candidateModels = [
    "gemini-2.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest",
  ];

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(18000), // 18s timeout guard
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2, // Low temperature for accounting precision
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!res.ok) {
        const errJson = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        const msg = errJson?.error?.message || `HTTP ${res.status}`;
        throw new Error(`Model ${model} returned error: ${msg}`);
      }

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error(`Model ${model} returned empty response.`);
      }

      return { text, modelUsed: model };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Try next model in candidateModels list
      continue;
    }
  }

  throw lastError || new Error("Failed to communicate with Gemini API.");
}

/**
 * Deterministic CPA Fallback:
 * Produces structured, professional financial reports directly from computed ledger
 * when the API key is not yet set or external network is unavailable.
 */
export function generateDeterministicAudit(
  queryType: "pnl" | "inventory" | "receivables" | "restock" | "general",
  ledger: FinancialLedger
): string {
  const php = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (queryType === "pnl") {
    return `### 📊 Executive Financial Statement — Rivera Fragrance House
**Period:** Current Month & Historical Total  
**Audit Timestamp:** ${new Date(ledger.timestamp).toLocaleString("en-PH")}  
**Currency:** Philippine Peso (PHP, ₱)

---

#### 1. Realized Income Statement
| Financial Metric | Amount (PHP) | % of Gross Revenue |
| :--- | :--- | :--- |
| **Gross Sales Turnover** | **${php(ledger.sales.totalRevenue)}** | 100.0% |
| **Cost of Goods Sold (COGS)** | -${php(ledger.sales.totalCost)} | ${ledger.sales.totalRevenue > 0 ? ((ledger.sales.totalCost / ledger.sales.totalRevenue) * 100).toFixed(1) : 0}% |
| **Realized Gross Profit** | **${php(ledger.sales.totalGrossProfit)}** | **${ledger.sales.grossMarginPct}%** |
| *Total Bottles Liquidated* | ${ledger.sales.unitsSold} units | — |
| *Average Order Value (AOV)* | ${php(ledger.sales.averageOrderValue)} | — |

---

#### 2. Period Revenue Trajectory
- **Today's Liquidated Sales**: ${php(ledger.sales.today.revenue)} (${php(ledger.sales.today.profit)} gross profit, ${ledger.sales.today.units} bottles)
- **This Week's Turnover**: ${php(ledger.sales.thisWeek.revenue)} (${php(ledger.sales.thisWeek.profit)} gross profit)
- **This Month's Turnover**: ${php(ledger.sales.thisMonth.revenue)} (${php(ledger.sales.thisMonth.profit)} gross profit)

---

#### 3. Senior Accountant Audit Commentary
- **Profit Margin Health**: Realized gross margin is **${ledger.sales.grossMarginPct}%**, which ${ledger.sales.grossMarginPct >= 30 ? "comfortably exceeds" : "is within"} the sustainable boutique fragrance threshold (30–45%).
- **Receivables Notice**: ₱${ledger.orders.pendingReceivables.toLocaleString()} remains pending in unverified orders. Confirming these receipts will immediately recognize additional cash flow.`;
  }

  if (queryType === "inventory" || queryType === "restock") {
    const restockTable = ledger.inventory.restockItems
      .slice(0, 10)
      .map(
        (i) =>
          `| ${i.brand} | ${i.scent_name} | ${i.currentStock} | ${php(i.costPrice)} | +${i.unitsNeeded} | ${php(i.capitalRequired)} |`
      )
      .join("\n");

    return `### 📦 Inventory Valuation & Restock Capital Forecast
**Audit Timestamp:** ${new Date(ledger.timestamp).toLocaleString("en-PH")}  
**Warehouse Location:** Malabon, Metro Manila  
**Currency:** Philippine Peso (PHP, ₱)

---

#### 1. Balance Sheet Asset Summary
| Asset Category | Value (PHP) | Notes |
| :--- | :--- | :--- |
| **Total Inventory at Purchase Cost** | **${php(ledger.inventory.costValue)}** | Physical capital locked in warehouse stock |
| **Target Retail Liquidation Potential** | **${php(ledger.inventory.retailValue)}** | Gross potential at regular listed prices |
| **Unrealized Gross Margin** | **${php(ledger.inventory.projectedGrossProfit)}** | Expected yield (**${ledger.inventory.projectedMarginPct}%** margin) |
| **Total Active Fragrance SKUs** | ${ledger.inventory.totalSKUs} items | Unique scents in catalog |
| **Total Physical Bottles in Stock** | ${ledger.inventory.totalUnits} bottles | Full presentations & verified decants |

---

#### 2. Critical Restock Alerts & Capital Budget
*Fragrances with 2 or fewer units in stock requiring wholesale replenishment:*

| Brand | Scent Name | Current Stock | Unit Cost | Target Reorder | Capital Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
${restockTable || "| — | All stock levels healthy | — | — | — | ₱0.00 |"}

**Total Working Capital Required for Replenishment:** **${php(ledger.inventory.restockCapitalNeeded)}**

---

#### 3. Accountant Directive
Ensure that fast-moving Middle Eastern staples (Rasasi Hawas, French Avenue Liquid Brun, Rayhaan, Armaf Club de Nuit) do not enter extended stockouts, as they drive the bulk of high-margin retail transactions.`;
  }

  if (queryType === "receivables") {
    return `### 💵 Payment Reconciliation & Receivables Audit
**Audit Timestamp:** ${new Date(ledger.timestamp).toLocaleString("en-PH")}  
**Currency:** Philippine Peso (PHP, ₱)

---

#### 1. Online Order Receivables Backlog
- **Pending Verification Orders**: **${ledger.orders.pendingCount} orders**
- **Unverified Pending Receivables**: **${php(ledger.orders.pendingReceivables)}**
- **Settled Online Orders**: **${php(ledger.orders.paidRevenue)}** (${ledger.orders.paidCount} fulfilled orders)
- **Pass-through Shipping Fees**: **${php(ledger.orders.shippingCollected)}**

---

#### 2. Reconciliation Protocol
1. Open the **Orders** tab in the admin portal.
2. Filter by status: \`pending_verification\`.
3. Check the customer's attached payment receipt against your **GCash / Maya / Bank statement**.
4. Click **Mark as Paid** to officially recognize the revenue and auto-record the transaction in the sales ledger.`;
  }

  // General audit
  return `### 🏛️ Executive Ledger Overview — Rivera Fragrance House
**Audit Timestamp:** ${new Date(ledger.timestamp).toLocaleString("en-PH")}  
**Currency:** Philippine Peso (PHP, ₱)

- **Total Inventory Asset Value**: **${php(ledger.inventory.costValue)}** (${ledger.inventory.totalUnits} bottles)
- **Target Retail Potential**: **${php(ledger.inventory.retailValue)}** (${ledger.inventory.projectedMarginPct}% projected margin)
- **Historical Sales Turnover**: **${php(ledger.sales.totalRevenue)}** (${ledger.sales.unitsSold} bottles liquidated, ${ledger.sales.grossMarginPct}% realized gross margin)
- **Pending Receivables Backlog**: **${php(ledger.orders.pendingReceivables)}** across ${ledger.orders.pendingCount} orders awaiting payment verification.
- **Restock Working Capital Needed**: **${php(ledger.inventory.restockCapitalNeeded)}** for ${ledger.inventory.lowStockCount + ledger.inventory.outOfStockCount} low-stock SKUs.`;
}
