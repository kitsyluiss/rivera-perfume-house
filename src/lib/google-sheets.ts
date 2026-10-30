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
 */
export function prepareGoogleSheetsPayload(ledger: FinancialLedger) {
  // Tab 1: Executive Balance Sheet & Summary
  const summaryRows = [
    ["RIVERA FRAGRANCE HOUSE — EXECUTIVE FINANCIAL BALANCE SHEET"],
    ["Audit Timestamp", new Date(ledger.timestamp).toLocaleString("en-PH")],
    ["Currency", "Philippine Peso (PHP, ₱)"],
    [],
    ["1. INVENTORY ASSET VALUATION", "VALUE (PHP)", "NOTES"],
    ["Total Inventory at Purchase Cost", ledger.inventory.costValue, "Capital tied up in physical stock"],
    ["Target Retail Liquidation Value", ledger.inventory.retailValue, "Gross turnover potential at full retail"],
    ["Unrealized Gross Margin", ledger.inventory.projectedGrossProfit, `${ledger.inventory.projectedMarginPct}% projected margin`],
    ["Total Physical Bottles in Stock", ledger.inventory.totalUnits, `${ledger.inventory.totalSKUs} unique SKUs`],
    ["Restock Working Capital Needed", ledger.inventory.restockCapitalNeeded, "To bring low stock (<= 2) to 5 units"],
    [],
    ["2. REALIZED INCOME STATEMENT", "VALUE (PHP)", "NOTES"],
    ["Gross Sales Turnover", ledger.sales.totalRevenue, `${ledger.sales.unitsSold} units liquidated`],
    ["Cost of Goods Sold (COGS)", ledger.sales.totalCost, "Historical acquisition cost"],
    ["Realized Gross Profit", ledger.sales.totalGrossProfit, `${ledger.sales.grossMarginPct}% realized margin`],
    ["Average Order Value (AOV)", ledger.sales.averageOrderValue, "Per customer transaction"],
    ["Today's Revenue", ledger.sales.today.revenue, `${ledger.sales.today.profit} profit (${ledger.sales.today.units} units)`],
    ["This Week's Revenue", ledger.sales.thisWeek.revenue, `${ledger.sales.thisWeek.profit} profit`],
    ["This Month's Revenue", ledger.sales.thisMonth.revenue, `${ledger.sales.thisMonth.profit} profit`],
    [],
    ["3. RECEIVABLES & CASH FLOW", "VALUE (PHP)", "NOTES"],
    ["Pending Verification Receivables", ledger.orders.pendingReceivables, `${ledger.orders.pendingCount} orders awaiting proof`],
    ["Settled Online Revenue", ledger.orders.paidRevenue, `${ledger.orders.paidCount} fulfilled orders`],
    ["Pass-through Shipping Collected", ledger.orders.shippingCollected, "Courier reimbursement"],
  ];

  // Tab 2: Brand Capital Allocation
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

  // Tab 3: Critical Restock Forecast (Stock <= 2)
  const restockRows = [
    ["Brand", "Scent Name", "Current Stock", "Unit Cost (PHP)", "Target Price (PHP)", "Units to Reorder", "Capital Required (PHP)"],
    ...ledger.inventory.restockItems.map((item) => [
      item.brand,
      item.scent_name,
      item.currentStock,
      item.costPrice,
      item.targetPrice,
      item.unitsNeeded,
      item.capitalRequired,
    ]),
  ];

  // Tab 4: Top Profit Contributors
  const topSellerRows = [
    ["Brand", "Scent Name", "Bottles Sold", "Turnover (PHP)", "COGS (PHP)", "Gross Profit (PHP)", "Profit Margin %"],
    ...ledger.sales.topSellers.map((s) => [
      s.brand,
      s.scent_name,
      s.qtySold,
      s.revenue,
      s.cost,
      s.profit,
      `${s.marginPct}%`,
    ]),
  ];

  return {
    timestamp: ledger.timestamp,
    sheets: {
      Executive_Summary: summaryRows,
      Brand_Allocation: brandRows,
      Restock_Forecast: restockRows,
      Top_Profit_Makers: topSellerRows,
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
