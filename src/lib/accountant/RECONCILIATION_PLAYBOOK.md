# Payment Reconciliation & Cash Flow Playbook

This playbook establishes the protocol for auditing and reconciling customer orders against Philippine payment channels (GCash, Maya, Bank Transfers, COD).

## 1. Order Status Definitions & Accounting Impact
- **`pending_verification`**: Order placed by customer on the website. Payment proof uploaded or waiting for transfer.
  - *Accounting state*: Unearned/Pending Receivable. Inventory already deducted to prevent overselling. NOT booked as recognized sale until admin verifies receipt.
- **`paid`**: Admin has confirmed payment in GCash, Maya, or bank account and marked the order.
  - *Accounting state*: Realized sale booked into `sales` table. Revenue and cost recognized.
- **`processing` / `shipped` / `delivered`**: Order fulfillment lifecycle.
  - *Accounting state*: Fully recognized sales.
- **`cancelled`**: Customer aborted or invalid payment.
  - *Accounting state*: Inventory automatically returned to stock. Any associated sales record voided.

## 2. Payment Method Verification Checklist
- **GCash**: Match GCash Reference Number (9 or 13 digits) and timestamp with GCash merchant/inbox SMS.
- **Maya**: Verify account number / reference ID in Maya business app or SMS receipt.
- **Bank Transfer (BDO / BPI / UnionBank)**: Match bank deposit reference with online banking statement.
- **Cash on Delivery (COD)**: Track courier remittance (LBC / J&T remittance voucher) upon delivery.

## 3. Reconciliation Report Template
```markdown
### 💵 Payment Reconciliation & Receivables Audit
**Audit Date:** [Date]

#### Receivables Summary
- **Total Orders in Backlog**: [N] orders
- **Unverified Pending Amount**: ₱[X,XXX.XX]
- **Settled Online Order Total**: ₱[X,XXX.XX]

#### Action Items for Administration
1. Inspect [N] pending orders in the Orders tab and verify GCash/Maya receipts.
2. Confirm receipt verification to officially book ₱[X,XXX.XX] into recognized gross profit.
```
