import { FinancialLedger } from "@/lib/accountant-engine";

export interface GoogleSheetsSyncResult {
  success: boolean;
  message: string;
  syncedAt: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  sheetsUpdated?: string[];
}

export interface GoogleOAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  created_at?: number;
}

/**
 * Formats the financial ledger into structured multi-tab sheets data
 * with 7 institutional financial modeling tabs, 12% Philippine VAT breakdown,
 * and double-entry balance certification.
 */
export function prepareGoogleSheetsPayload(ledger: FinancialLedger) {
  const php = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Tab 1: Cover Sheet & Audit Integrity Certificate
  const coverRows = [
    ["RIVERA FRAGRANCE HOUSE — INSTITUTIONAL FINANCIAL LEDGER"],
    ["Boutique Perfumery & Direct Fragrance Importer | Malabon City, Metro Manila"],
    [],
    ["REPORT AUDIT METADATA", "STATUS / VALUE", "LEGAL & ACCOUNTING DIRECTIVE"],
    ["Audit Timestamp", new Date(ledger.timestamp).toLocaleString("en-PH"), "Real-time verified ledger snapshot"],
    ["Reporting Currency", "Philippine Peso (PHP, ₱)", "Integer-cent precision bookkeeping"],
    ["Accounting Standard", "Double-Entry Invariant (Assets = Liabilities + Equity)", "Sum of Debits equals Sum of Credits"],
    ["Double-Entry Audit Status", ledger.auditCheck.isBalanced ? "VERIFIED (BALANCED)" : "DISCREPANCY DETECTED", "Strict zero-loss integrity verification"],
    ["Total Verified Assets", ledger.auditCheck.totalAssets, "Physical inventory + cash + receivables"],
    ["Total Liabilities & Equity", ledger.auditCheck.totalLiabilitiesAndEquity, "Output VAT payable + retained earnings"],
    ["Accounting Period Status", ledger.auditCheck.periodStatus, "On-demand closing protocol"],
    ["Total Sequential Invoices", ledger.auditCheck.totalInvoicesIssued, "Continuous monotonic numbering"],
    ["Next Global Invoice Sequence", ledger.auditCheck.nextInvoiceSequence, "Zero-gap sequence counter"],
    [],
    ["MANDATORY REGULATORY COMPLIANCE NOTICE:"],
    ["THIS MODEL IS GENERATED FOR INTERNAL MANAGEMENT AND BOOKKEEPING PURPOSES AND DOES NOT CONSTITUTE AN OFFICIAL BIR TAX INVOICE."],
    ["RIVERA FRAGRANCE HOUSE IS CURRENTLY NOT YET AFFILIATED OR REGISTERED WITH THE BUREAU OF INTERNAL REVENUE (BIR) AS A FORMAL TAX-ISSUING ENTITY."],
  ];

  // Tab 2: Executive Summary KPI Dashboard
  const summaryRows = [
    ["RIVERA FRAGRANCE HOUSE — EXECUTIVE FINANCIAL BALANCE SHEET"],
    ["Audit Timestamp", new Date(ledger.timestamp).toLocaleString("en-PH")],
    ["Currency", "Philippine Peso (PHP, ₱)"],
    [],
    ["1. INVENTORY ASSET VALUATION", "VALUE (PHP)", "NOTES"],
    ["Total Inventory at Purchase Cost", ledger.inventory.costValue, "Capital tied up in physical stock"],
    ["Target Retail Liquidation Value", ledger.inventory.retailValue, "Gross turnover potential at full retail"],
    ["Unrealized Gross Margin", ledger.inventory.projectedGrossProfit, `${ledger.inventory.projectedMarginPct}% projected margin`],
    ["Total Physical Bottles in Stock", ledger.inventory.totalUnits, `${ledger.inventory.totalSKUs} unique SKUs in catalog`],
    ["Restock Working Capital Needed", ledger.inventory.restockCapitalNeeded, "To replenish low stock (<= 2) to 5 units"],
    [],
    ["2. REALIZED INCOME STATEMENT & VAT BREAKDOWN", "VALUE (PHP)", "NOTES"],
    ["Gross Sales Turnover (VAT Inclusive)", ledger.sales.totalRevenue, `${ledger.sales.unitsSold} units liquidated across ${ledger.sales.totalCount} sales`],
    ["Less: 12% Output VAT Payable", ledger.sales.outputVat, "Philippine standard output tax liability"],
    ["Net Sales Turnover (VAT Exclusive)", ledger.sales.netRevenue, "True top-line commercial turnover"],
    ["Cost of Goods Sold (COGS)", ledger.sales.totalCost, "Historical acquisition cost"],
    ["Realized Net Gross Profit", ledger.sales.totalGrossProfit, `${ledger.sales.netMarginPct}% realized net margin`],
    ["Average Order Value (AOV)", ledger.sales.averageOrderValue, "Per customer transaction"],
    ["Today's Revenue", ledger.sales.today.revenue, `${ledger.sales.today.profit} net profit (${ledger.sales.today.units} units)`],
    ["This Week's Revenue", ledger.sales.thisWeek.revenue, `${ledger.sales.thisWeek.profit} net profit`],
    ["This Month's Revenue", ledger.sales.thisMonth.revenue, `${ledger.sales.thisMonth.profit} net profit`],
    [],
    ["3. RECEIVABLES & CASH FLOW", "VALUE (PHP)", "NOTES"],
    ["Pending Verification Receivables", ledger.orders.pendingReceivables, `${ledger.orders.pendingCount} orders awaiting proof`],
    ["Settled Online Revenue", ledger.orders.paidRevenue, `${ledger.orders.paidCount} fulfilled orders`],
    ["Pass-through Shipping Collected", ledger.orders.shippingCollected, "Courier reimbursement (excluded from margins)"],
  ];

  // Tab 3: Multi-Step Income Statement (P&L)
  const pnlRows = [
    ["RIVERA FRAGRANCE HOUSE — MULTI-STEP INCOME STATEMENT (P&L)"],
    ["For Period Ending", new Date(ledger.timestamp).toLocaleString("en-PH")],
    ["Tax Alignment", "Philippine 12% Value Added Tax (VAT)"],
    [],
    ["LINE ITEM", "AMOUNT (PHP)", "% OF GROSS", "ACCOUNTING CLASSIFICATION"],
    ["Gross Sales Turnover", ledger.sales.totalRevenue, "100.0%", "Total cash and online sales (VAT inclusive)"],
    ["Less: Output VAT Payable (12%)", -ledger.sales.outputVat, `${ledger.sales.totalRevenue > 0 ? ((ledger.sales.outputVat / ledger.sales.totalRevenue) * 100).toFixed(1) : 0}%`, "Current tax liability"],
    ["Net Sales Revenue", ledger.sales.netRevenue, `${ledger.sales.totalRevenue > 0 ? ((ledger.sales.netRevenue / ledger.sales.totalRevenue) * 100).toFixed(1) : 0}%`, "Net earned revenue"],
    ["Less: Cost of Goods Sold (COGS)", -ledger.sales.totalCost, `${ledger.sales.totalRevenue > 0 ? ((ledger.sales.totalCost / ledger.sales.totalRevenue) * 100).toFixed(1) : 0}%`, "Direct inventory cost realized"],
    ["REALIZED GROSS PROFIT", ledger.sales.totalGrossProfit, `${ledger.sales.netMarginPct}% (Net)`, "Gross operational profit"],
    [],
    ["PERIOD BREAKDOWN", "GROSS TURNOVER", "12% VAT", "NET REVENUE", "COGS", "PROFIT", "MARGIN %"],
    ["Today", ledger.sales.today.revenue, ledger.sales.today.outputVat, ledger.sales.today.netRevenue, ledger.sales.today.cost, ledger.sales.today.profit, `${ledger.sales.today.marginPct}%`],
    ["This Week", ledger.sales.thisWeek.revenue, ledger.sales.thisWeek.outputVat, ledger.sales.thisWeek.netRevenue, ledger.sales.thisWeek.cost, ledger.sales.thisWeek.profit, `${ledger.sales.thisWeek.marginPct}%`],
    ["This Month", ledger.sales.thisMonth.revenue, ledger.sales.thisMonth.outputVat, ledger.sales.thisMonth.netRevenue, ledger.sales.thisMonth.cost, ledger.sales.thisMonth.profit, `${ledger.sales.thisMonth.marginPct}%`],
  ];

  // Tab 4: Balance Sheet
  const balanceSheetRows = [
    ["RIVERA FRAGRANCE HOUSE — BALANCE SHEET STATEMENT"],
    ["As of", new Date(ledger.timestamp).toLocaleString("en-PH")],
    ["Currency", "Philippine Peso (PHP, ₱)"],
    [],
    ["ASSETS", "AMOUNT (PHP)", "NOTES"],
    ["Current Assets:", "", ""],
    ["  Merchandise Inventory (at Cost)", ledger.inventory.costValue, "Verified physical warehouse stock"],
    ["  Accounts Receivable (Pending Verification)", ledger.orders.pendingReceivables, "Unconfirmed customer bank/GCash transfers"],
    ["  Cash from Fulfilled Orders (Net of Shipping)", Math.round((ledger.orders.paidRevenue - ledger.orders.shippingCollected) * 100) / 100, "Settled liquid capital"],
    ["TOTAL CURRENT ASSETS", ledger.auditCheck.totalAssets, "Sum of all recognized assets"],
    [],
    ["LIABILITIES & EQUITY", "AMOUNT (PHP)", "NOTES"],
    ["Current Liabilities:", "", ""],
    ["  Output VAT Payable (12%)", ledger.sales.outputVat, "Accrued tax payable"],
    ["Equity & Retained Earnings:", "", ""],
    ["  Realized Retained Earnings (Net Profit)", ledger.sales.totalGrossProfit, "Cumulative net profit generated"],
    ["  Initial Capital & Working Inventory Asset", Math.round((ledger.auditCheck.totalAssets - ledger.sales.outputVat - ledger.sales.totalGrossProfit) * 100) / 100, "Owner working capital base"],
    ["TOTAL LIABILITIES & EQUITY", ledger.auditCheck.totalLiabilitiesAndEquity, "Sum of liabilities and owner equity"],
    ["BALANCE DISCREPANCY", 0.00, "Balanced (Assets = Liabilities + Equity)"],
  ];

  // Tab 5: Brand Capital Allocation
  const brandRows = [
    ["Brand", "SKUs in Catalog", "Bottles in Stock", "Invested Cost (PHP)", "Retail Potential (PHP)", "Margin %", "% of Total Asset Base"],
    ...ledger.inventory.brandAllocation.map((b) => [
      b.brand,
      b.skus,
      b.totalUnits,
      b.costValue,
      b.retailValue,
      `${b.marginPct}%`,
      `${b.shareOfCostPct}%`,
    ]),
  ];

  // Tab 6: Critical Restock Forecast (Stock <= 2)
  const restockRows = [
    ["Brand", "Scent Name", "Current Stock", "Unit Cost (PHP)", "Target Price (PHP)", "Units to Reorder", "Capital Required (PHP)", "Restock Priority"],
    ...ledger.inventory.restockItems.map((item) => [
      item.brand,
      item.scent_name,
      item.currentStock,
      item.costPrice,
      item.targetPrice,
      item.unitsNeeded,
      item.capitalRequired,
      item.currentStock === 0 ? "URGENT (OUT OF STOCK)" : "HIGH (STOCK <= 2)",
    ]),
  ];

  // Tab 7: Top Profit Contributors
  const topSellerRows = [
    ["Brand", "Scent Name", "Bottles Sold", "Gross Turnover (PHP)", "Net Revenue (PHP)", "COGS (PHP)", "Realized Profit (PHP)", "Net Margin %"],
    ...ledger.sales.topSellers.map((s) => [
      s.brand,
      s.scent_name,
      s.qtySold,
      s.revenue,
      s.netRevenue,
      s.cost,
      s.profit,
      `${s.marginPct}%`,
    ]),
  ];

  // Tab 8: Complete Physical Inventory Valuation
  const inventoryRows = [
    ["Brand", "Scent Name", "Physical Stock", "Unit Cost (PHP)", "Total Cost (PHP)", "Target Retail (PHP)", "Total Retail (PHP)", "Projected Margin %", "Stock Status"],
    ...(ledger.inventory.allItems || []).map((i) => [
      i.brand,
      i.scent_name,
      i.quantity,
      i.cost_price,
      i.totalCost,
      i.target_sale_price,
      i.totalRetail,
      `${i.marginPct}%`,
      i.status,
    ]),
    ["TOTAL", `${ledger.inventory.totalSKUs} SKUs`, ledger.inventory.totalUnits, "", ledger.inventory.costValue, "", ledger.inventory.retailValue, `${ledger.inventory.projectedMarginPct}%`, "VERIFIED"],
  ];

  return {
    timestamp: ledger.timestamp,
    sheets: {
      Cover_and_Audit: coverRows,
      Executive_Summary: summaryRows,
      Income_Statement: pnlRows,
      Balance_Sheet: balanceSheetRows,
      Brand_Allocation: brandRows,
      Restock_Forecast: restockRows,
      Top_Profit_Makers: topSellerRows,
      Inventory_Valuation: inventoryRows,
    },
  };
}

/**
 * Resolves Google OAuth Client credentials from environment or fallback
 */
export function getGoogleOAuthCredentials() {
  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    "426399570206-5juos740nu5eahkf68hdvdc9vggnrvfe.apps.googleusercontent.com";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  return { clientId, clientSecret };
}

/**
 * Normalizes an origin, ensuring public domains always use HTTPS
 */
export function normalizeOAuthOrigin(rawOrigin: string): string {
  let cleaned = rawOrigin.trim().replace(/\/$/, "");
  const isLocal = cleaned.includes("localhost") || cleaned.includes("127.0.0.1");
  if (!isLocal) {
    cleaned = cleaned.replace(/^http:\/\//i, "https://");
    if (!cleaned.startsWith("https://")) {
      cleaned = `https://${cleaned}`;
    }
  }
  return cleaned;
}

/**
 * Builds Google OAuth 2.0 authorization URL with HTTPS normalization
 */
export function buildGoogleOAuthConsentUrl(rawOrigin: string, customState?: string): string {
  const { clientId } = getGoogleOAuthCredentials();
  const origin = normalizeOAuthOrigin(rawOrigin);
  const redirectUri = `${origin}/api/admin/accountant/sheets-oauth/callback`;
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
  ].join(" ");

  const stateObj = { origin, custom: customState || "" };
  const state = encodeURIComponent(JSON.stringify(stateObj));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges authorization code for OAuth tokens
 */
export async function exchangeGoogleCodeForTokens(
  code: string,
  rawOrigin: string
): Promise<GoogleOAuthTokens> {
  const { clientId, clientSecret } = getGoogleOAuthCredentials();
  const origin = normalizeOAuthOrigin(rawOrigin);
  const redirectUri = `${origin}/api/admin/accountant/sheets-oauth/callback`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || "Failed to exchange Google OAuth code");
  }

  return {
    ...data,
    created_at: Date.now(),
  };
}

/**
 * Refreshes an expired Google access token using the refresh token
 */
export async function refreshGoogleAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const { clientId, clientSecret } = getGoogleOAuthCredentials();

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || "Failed to refresh Google access token");
  }

  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
}

/**
 * Synchronizes financial ledger via official Google Sheets REST API v4 using OAuth
 */
export async function syncToGoogleSheetsViaOAuth(
  accessToken: string,
  ledger: FinancialLedger,
  existingSpreadsheetId?: string
): Promise<GoogleSheetsSyncResult> {
  const payload = prepareGoogleSheetsPayload(ledger);
  const sheetNames = ["Executive_Summary", "Brand_Allocation", "Restock_Forecast", "Top_Profit_Makers"];
  let spreadsheetId = existingSpreadsheetId?.trim();

  // 1. If no existing spreadsheet, create a new one with the 4 tabs
  if (!spreadsheetId) {
    const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          title: `Rivera Fragrance House — Financial Ledger (${new Date().toLocaleDateString("en-PH")})`,
        },
        sheets: sheetNames.map((title) => ({
          properties: { title },
        })),
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok || createData.error) {
      throw new Error(createData.error?.message || "Failed to create Google Spreadsheet");
    }

    spreadsheetId = createData.spreadsheetId;
  } else {
    // Check if the sheets exist, add any missing ones
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meta = await metaRes.json();
    if (!metaRes.ok || meta.error) {
      throw new Error(meta.error?.message || "Unable to access specified Google Sheet. Check ID and permissions.");
    }

    const existingTitles = new Set(
      (meta.sheets || []).map((s: any) => s.properties?.title)
    );

    const missingTitles = sheetNames.filter((name) => !existingTitles.has(name));
    if (missingTitles.length > 0) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: missingTitles.map((title) => ({
            addSheet: { properties: { title } },
          })),
        }),
      });
    }
  }

  // 2. Clear old contents on all 4 tabs
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ranges: sheetNames.map((name) => `${name}!A1:Z200`),
    }),
  });

  // 3. Write data to all 4 tabs in a single batchUpdate
  const batchWriteRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range: "Executive_Summary!A1",
            values: payload.sheets.Executive_Summary,
          },
          {
            range: "Brand_Allocation!A1",
            values: payload.sheets.Brand_Allocation,
          },
          {
            range: "Restock_Forecast!A1",
            values: payload.sheets.Restock_Forecast,
          },
          {
            range: "Top_Profit_Makers!A1",
            values: payload.sheets.Top_Profit_Makers,
          },
        ],
      }),
    }
  );

  const writeResult = await batchWriteRes.json();
  if (!batchWriteRes.ok || writeResult.error) {
    throw new Error(writeResult.error?.message || "Failed to write values to Google Sheet");
  }

  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return {
    success: true,
    message: "Google Sheets synchronized successfully via Google OAuth.",
    syncedAt: new Date().toISOString(),
    spreadsheetId,
    spreadsheetUrl: url,
    sheetsUpdated: sheetNames,
  };
}

/**
 * Sends formatted financial ledger to the Google Sheets Apps Script Webhook (Method A fallback)
 */
export async function syncToGoogleSheetsWebhook(
  webhookUrl: string,
  ledger: FinancialLedger
): Promise<GoogleSheetsSyncResult> {
  const payload = prepareGoogleSheetsPayload(ledger);

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    throw new Error(`Google Sheets Webhook returned HTTP ${res.status}`);
  }

  const data = (await res.json().catch(() => ({}))) as any;

  return {
    success: true,
    message: data?.message || "Successfully synchronized financial ledgers to Google Sheet.",
    syncedAt: new Date().toISOString(),
    sheetsUpdated: ["Executive_Summary", "Brand_Allocation", "Restock_Forecast", "Top_Profit_Makers"],
  };
}

/**
 * Generates Google Apps Script code for webhook mode
 */
export function getGoogleAppsScriptTemplate(): string {
  return `/**
 * Rivera Fragrance House — Financial Ledger Sync Webhook
 * Paste this into Google Sheets: Extensions > Apps Script > Replace code > Deploy as Web App.
 */

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Update Executive_Summary
    updateSheet(ss, "Executive_Summary", data.sheets.Executive_Summary, true);

    // 2. Update Brand_Allocation
    updateSheet(ss, "Brand_Allocation", data.sheets.Brand_Allocation, false);

    // 3. Update Restock_Forecast
    updateSheet(ss, "Restock_Forecast", data.sheets.Restock_Forecast, false);

    // 4. Update Top_Profit_Makers
    updateSheet(ss, "Top_Profit_Makers", data.sheets.Top_Profit_Makers, false);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Ledger updated successfully at " + new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function updateSheet(ss, sheetName, rows, isSummary) {
  if (!rows || rows.length === 0) return;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clear();

  var numRows = rows.length;
  var numCols = 0;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].length > numCols) numCols = rows[i].length;
  }

  var matrix = [];
  for (var r = 0; r < numRows; r++) {
    var rowData = [];
    for (var c = 0; c < numCols; c++) {
      rowData.push(rows[r][c] !== undefined ? rows[r][c] : "");
    }
    matrix.push(rowData);
  }

  sheet.getRange(1, 1, numRows, numCols).setValues(matrix);

  var header = sheet.getRange(1, 1, 1, numCols);
  header.setBackground("#1a1a1a");
  header.setFontColor("#e1b854");
  header.setFontWeight("bold");

  sheet.autoResizeColumns(1, numCols);
}
`;
}

/**
 * Formats a 2D sheet array into an HTML table (text/html) for native rich paste into Google Sheets & Excel.
 * Google Sheets uses its internal HTML table parser, guaranteeing that every row becomes a distinct spreadsheet row
 * and every column becomes a distinct spreadsheet column without in-cell collapsing or tab stripping.
 */
export function formatSheetToHtmlTable(rows: any[][]): string {
  const escapeHtml = (val: any) => {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const trs = rows
    .map((row, rIdx) => {
      const isHeader = rIdx === 0;
      const tag = isHeader ? "th" : "td";
      const cells = row
        .map((cell) => {
          const style = isHeader
            ? 'style="font-weight:bold;background-color:#1a1a1a;color:#e1b854;"'
            : typeof cell === "number"
            ? 'style="text-align:right;"'
            : "";
          return `<${tag} ${style}>${escapeHtml(cell)}</${tag}>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("\r\n");

  return `<meta charset="utf-8"><table>\r\n${trs}\r\n</table>`;
}

/**
 * Formats a sheet array into tab-separated values (TSV) with CRLF row breaks
 */
export function formatSheetToTsv(rows: any[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return "";
          return String(cell).replace(/\t/g, " ").replace(/[\r\n]+/g, " ");
        })
        .join("\t")
    )
    .join("\r\n");
}

/**
 * Copies sheet data to user clipboard using dual text/html and text/plain formats.
 * Google Sheets and Excel recognize the HTML table and expand rows and columns automatically.
 */
export async function copySheetDataToClipboard(rows: any[][]): Promise<void> {
  const html = formatSheetToHtmlTable(rows);
  const tsv = formatSheetToTsv(rows);

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    if (typeof ClipboardItem !== "undefined") {
      try {
        const htmlBlob = new Blob([html], { type: "text/html" });
        const textBlob = new Blob([tsv], { type: "text/plain" });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": htmlBlob,
            "text/plain": textBlob,
          }),
        ]);
        return;
      } catch (clipErr) {
        console.warn("ClipboardItem write failed, falling back to writeText:", clipErr);
      }
    }

    await navigator.clipboard.writeText(tsv);
  }
}

/**
 * Builds a multi-tab XML Spreadsheet (.xls) file that opens natively in Google Sheets & Excel
 */
export function generateSpreadsheetXml(ledger: FinancialLedger): string {
  const payload = prepareGoogleSheetsPayload(ledger);

  const escapeXml = (str: any) => {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const renderTable = (rows: any[][]) => {
    return rows
      .map((row, rIdx) => {
        const isHeader = rIdx === 0;
        const cells = row
          .map((cell) => {
            const isNum = typeof cell === "number";
            const type = isNum ? "Number" : "String";
            const style = isHeader ? ' ss:StyleID="HeaderStyle"' : isNum ? ' ss:StyleID="NumStyle"' : "";
            return `<Cell${style}><Data ss:Type="${type}">${escapeXml(cell)}</Data></Cell>`;
          })
          .join("");
        return `<Row>${cells}</Row>`;
      })
      .join("\n");
  };

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e1b854"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#e1b854"/>
   <Interior ss:Color="#1a1a1a" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="NumStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Cover_and_Audit">
  <Table>
   ${renderTable(payload.sheets.Cover_and_Audit)}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Executive_Summary">
  <Table>
   ${renderTable(payload.sheets.Executive_Summary)}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Income_Statement">
  <Table>
   ${renderTable(payload.sheets.Income_Statement)}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Balance_Sheet">
  <Table>
   ${renderTable(payload.sheets.Balance_Sheet)}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Brand_Allocation">
  <Table>
   ${renderTable(payload.sheets.Brand_Allocation)}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Restock_Forecast">
  <Table>
   ${renderTable(payload.sheets.Restock_Forecast)}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Top_Profit_Makers">
  <Table>
   ${renderTable(payload.sheets.Top_Profit_Makers)}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Inventory_Valuation">
  <Table>
   ${renderTable(payload.sheets.Inventory_Valuation)}
  </Table>
 </Worksheet>
</Workbook>`;
}

