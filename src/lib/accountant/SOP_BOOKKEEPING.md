# Rivera Fragrance House — Standard Operating Procedures (SOP): Bookkeeping & Financial Math

> **Zero Hallucination Rule**: The AI Accountant must NEVER guess, fabricate, or estimate financial numbers. All base metrics are strictly computed by the server-side ledger engine directly from database records. The AI's role is analysis, audit verification, commentary, and structured reporting.

## 1. Inventory Asset Accounting
- **Asset Cost Value (Capital Tied Up)**:
  $$\text{Inventory Cost} = \sum_{i=1}^{N} (\text{Quantity}_i \times \text{Cost Price}_i)$$
  Represents current balance sheet inventory asset at historical purchase cost.
- **Target Retail Liquidation Valuation**:
  $$\text{Retail Valuation} = \sum_{i=1}^{N} (\text{Quantity}_i \times \text{Target Sale Price}_i)$$
  Represents expected gross proceeds if all remaining inventory sells at listed regular retail prices.
- **Projected Unrealized Gross Margin**:
  $$\text{Projected Profit} = \text{Retail Valuation} - \text{Inventory Cost}$$
  $$\text{Projected Margin \%} = \left(\frac{\text{Projected Profit}}{\text{Retail Valuation}}\right) \times 100\%$$
- **Capital Allocation by Brand**:
  $$\text{Brand Capital Share \%} = \left(\frac{\text{Brand Inventory Cost}}{\text{Total Inventory Cost}}\right) \times 100\%$$

## 2. Realized Sales & COGS Bookkeeping
- **Realized Revenue (Gross Turnover)**:
  $$\text{Revenue} = \sum_{j=1}^{M} (\text{Quantity Sold}_j \times \text{Unit Sale Price}_j)$$
- **Realized Cost of Goods Sold (COGS)**:
  $$\text{COGS} = \sum_{j=1}^{M} (\text{Quantity Sold}_j \times \text{Cost at Sale}_j)$$
- **Realized Gross Profit**:
  $$\text{Gross Profit} = \text{Revenue} - \text{COGS}$$
- **Realized Gross Profit Margin**:
  $$\text{Gross Margin \%} = \left(\frac{\text{Gross Profit}}{\text{Revenue}}\right) \times 100\%$$
- **Average Order Value (AOV / Ticket Size)**:
  $$\text{AOV} = \frac{\text{Total Revenue}}{\text{Total Transactions}}$$

## 3. Order Cash Flow & Receivables
- **Accounts Receivable (Pending Verification)**:
  Orders in `pending_verification` status. These represent uncollected or unconfirmed funds where customers placed orders but payment screenshots or bank deposits have not yet been marked `paid`.
- **Settled Online Revenue**:
  Orders in `paid`, `shipped`, or `delivered` status.
- **Shipping Pass-Through**:
  Shipping fees collected must be tracked separately from merchandise revenue to avoid inflating gross perfume profit margins.

## 4. Reorder Planning & Stock Safety Thresholds
- **Critical Low Stock Threshold**: Stock $\le 2$ units (Immediate Reorder Alert).
- **Out of Stock**: Stock $= 0$ units (Lost Revenue Risk).
- **Target Restock Level**: Baseline 5 units per active fast-selling SKU.
- **Restock Budget Requirement**:
  $$\text{Restock Capital} = \sum (\max(0, 5 - \text{Current Stock}_k) \times \text{Cost Price}_k)$$
