import { FinancialLedger } from "@/lib/accountant-engine";

export interface GoogleSheetsSyncResult {
  success: boolean;
  message: string;
  syncedAt: string;
  sheetsUpdated?: string[];
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
 * Sends formatted financial ledger to the Google Sheets Apps Script Webhook
 */
export async function syncToGoogleSheetsWebhook(
  webhookUrl: string,
  ledger: FinancialLedger
): Promise<GoogleSheetsSyncResult> {
  const payload = prepareGoogleSheetsPayload(ledger);

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // Apps Script accepts text/plain to avoid CORS preflight issues
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000), // 20s timeout
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
 * Generates the Google Apps Script code for the user to paste into their Google Sheet
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

  // Pad rows
  var matrix = [];
  for (var r = 0; r < numRows; r++) {
    var rowData = [];
    for (var c = 0; c < numCols; c++) {
      rowData.push(rows[r][c] !== undefined ? rows[r][c] : "");
    }
    matrix.push(rowData);
  }

  sheet.getRange(1, 1, numRows, numCols).setValues(matrix);

  // Style header row
  var header = sheet.getRange(1, 1, 1, numCols);
  header.setBackground("#1a1a1a");
  header.setFontColor("#e1b854");
  header.setFontWeight("bold");

  sheet.autoResizeColumns(1, numCols);
}
`;
}
