# Pharmacy UX Prototype — Workflow & Gap Fix Plan

> **Purpose:** Complete UX design document for developer handoff.  
> **Context:** MedPlus Pharmacy, Banjara Hills, Hyderabad, Telangana.  
> **Scope:** HTML/CSS/JS prototype with dummy data — no backend.

---

## 1. COMPLETE WORKFLOW DEFINITIONS

### Cycle A: Procurement (Buying Stock)

| ID | Workflow | Description | Screen(s) |
|----|----------|-------------|------------|
| WF-A1 | Reorder Alert | System shows products below reorder level on Overview dashboard | `overview.html` |
| WF-A2 | Purchase Order (PO) | Pharmacist selects products + quantities → exports as Excel/PDF to send to supplier. Only name + qty needed (no batch/expiry/cost — unknown at order time) | `purchase-orders.html` (**NEW**) |
| WF-A3 | Goods Receipt (GRN) | When supplier delivers, pharmacist enters supplier invoice details: product + batch + expiry + MRP + cost + quantity received. This is the source of truth for stock. | `purchases.html` (redesigned) |
| WF-A4 | Partial GRN | Supplier delivers partial shipment. Some lines marked "received", others "pending" | `purchases.html` |
| WF-A5 | Purchase Return | Return damaged/expired goods to supplier (debit note) | `returns.html` (purchase return tab) |

### Cycle B: Sales (Selling to Customers)

| ID | Workflow | Description | Screen(s) |
|----|----------|-------------|------------|
| WF-B1 | Walk-in OTC Sale | Default: Cash Customer (anonymous). Pharmacist searches product → sees live stock + batch (FEFO) → picks qty → system blocks expired batches → payment → invoice | `sales.html` |
| WF-B2 | Prescription Dispense | Doctor sends Rx → appears in queue → pharmacist verifies Schedule H → picks batches → dispenses → generates invoice linked to Rx | `prescription-dispense.html` |
| WF-B3 | Sale Return | Customer returns medicine (defect/wrong item). Pharmacist references original invoice → selects items → stock adjusts back | `returns.html` (sale return tab) |
| WF-B4 | Hold/Park Bill | Pharmacist pauses mid-sale (customer went to get money, etc.) → resumes later | `sales.html` (hold feature) |

### Cycle C: Inventory Management

| ID | Workflow | Description | Screen(s) |
|----|----------|-------------|------------|
| WF-C1 | Product Master Import | Bulk import product catalog from Excel (no stock — just master data: name, form, schedule, HSN, MRP, GST) | `products.html` + import button |
| WF-C2 | Stock Adjustment | Physical count ≠ system count → adjust up/down with reason | `stock-adjustments.html` |
| WF-C3 | Damage Record | Record damaged units → reduce stock with evidence | `damages.html` |
| WF-C4 | Expiry Monitor | Dashboard shows batches expiring within 90 days → block from sale when expired → facilitate return to supplier | `overview.html` + `reports.html` |
| WF-C5 | Stock Valuation | Products page shows derived stock (sum of all active GRN batches - sales - damages ± adjustments) | `products.html` detail view |

### Cycle D: Compliance & Reporting (Telangana)

| ID | Workflow | Description | Screen(s) |
|----|----------|-------------|------------|
| WF-D1 | Cash Drawer Reconciliation | Day-end: system expected vs physical cash → log discrepancy | `overview.html` |
| WF-D2 | GST Filing Report | Monthly CGST/SGST summary, GSTR-1/3B ready export | `reports.html` (GST tab) |
| WF-D3 | Schedule H Register | Mandatory log of every Schedule H/H1 drug dispensed with Rx reference, patient, doctor | `reports.html` (Schedule H tab) |
| WF-D4 | Stock Register | Drug-license-compliant register (opening + purchases - sales - damages ± adj = closing) | `reports.html` (Stock Register tab) |
| WF-D5 | Expiry Report | Batches expiring in 30/60/90 days with value exposure | `reports.html` (Expiry tab) |

---

## 2. NAVIGATION STRUCTURE (Updated)

```
Overview | Products | Suppliers | Customers | Purchase Orders | GRN (Goods Receipt) | Sales | Rx Dispense | Returns | Damages | Stock Adj. | Reports
```

**Change from current:** Split "Purchases" into two tabs:
- **Purchase Orders** — what you want to order (name + qty → export to supplier)
- **GRN (Goods Receipt)** — what actually arrived (full details: batch, expiry, MRP, cost, qty)

---

## 3. GAP ANALYSIS (Current vs Required)

### 🔴 Critical Gaps (Breaks core pharmacy operations)

| # | Gap | Impact | Fix |
|---|-----|--------|-----|
| G1 | **Sales flow forces customer selection** | Walk-in OTC customers don't have profiles. 80% of retail pharmacy sales are anonymous cash sales. | Default "Cash Customer" — customer search is optional |
| G2 | **Sales has no live stock visibility** | Pharmacist can't see what's actually in stock when adding products. Risk of selling unavailable items. | Show stock count next to product in search dropdown, show batch with expiry (FEFO order) |
| G3 | **Sales has no batch picker** | No way to select which batch to sell from. Required for FEFO, traceability, and expiry management. | Add batch dropdown (auto-selects FEFO, allows override) in line items |
| G4 | **Sales doesn't block expired batches** | Expired medicine can be sold — regulatory violation and patient safety risk | Expired batches shown but greyed/blocked with "EXPIRED" label |
| G5 | **GRN (purchases.html) has no batch/expiry/MRP/cost** | Was removed per earlier request, but these fields come FROM the supplier invoice at GRN time. Without them: no expiry tracking, no batch traceability, no valuation, no FEFO | Restore batch, expiry, MRP, cost price to GRN lines. Add auto-fill hints from last purchase. |
| G6 | **No Purchase Order screen** | User envisioned "enter name+qty, export to supplier". Current Purchases is actually GRN (receiving). The ordering step is missing entirely. | Create new `purchase-orders.html` |

### 🟠 Important Gaps (Degrades user experience)

| # | Gap | Impact | Fix |
|---|-----|--------|-----|
| G7 | **No amount-tendered / change calculator** | Cash sales: pharmacist enters ₹500, system shows "Change: ₹27.18". Essential for retail. | Add amount tendered + change display in Payment step |
| G8 | **No Hold/Park bill** | Pharmacist must complete or cancel sale. Can't pause for customer to return. | Add "Hold" button that saves draft, shows in list as "On Hold" |
| G9 | **No partial GRN** | Supplier delivers 3 of 5 items ordered. Can't mark some received, others pending. | Add per-line "Received" checkbox in GRN |
| G10 | **Data inconsistency (P001 vs MED001)** | Products use MED001, some sales reference P001. Confuses developer handoff. | Standardize all codes to MED-prefix |
| G11 | **Some list rows not clickable** | Only first row in purchase list navigates to detail. Others are dead. | Make all rows clickable (already handled by pharmacy-ux.js pattern but markup needs onclick) |
| G12 | **Sales header has wrong Export/Import icons** | Sales uses ↓/↑ while other pages use ▲/▼ | Standardize to ▲ Export / ▼ Import across all pages |

### 🟡 Nice-to-Have Gaps (Polish for developer clarity)

| # | Gap | Impact | Fix |
|---|-----|--------|-----|
| G13 | **No online orders page linked from nav** | `online-orders.html` exists but not in nav | Add to nav or merge into Sales with filter tab |
| G14 | **Overview stock register shows all 0** | Developer won't understand dynamic data flow | Add some non-zero stock entries matching Products data |
| G15 | **Products detail batch table disconnected from GRN** | Developer needs to see data flow: GRN creates batches → Products shows them | Add GRN reference in batch table, note explaining data source |
| G16 | **Customer names in Sales are Western** | Should match Telangana context (Srinivas Reddy, Lakshmi Devi, etc.) | Update sample data |

---

## 4. IMPLEMENTATION PLAN (Ordered by priority)

### Phase 1: Structural Changes (New screens + Navigation)

| Task | File | Description |
|------|------|-------------|
| T1 | `purchase-orders.html` | **CREATE** — Purchase Order screen: List view + Create PO (product+qty only) + PO Detail with Export button |
| T2 | `purchases.html` | **REDESIGN** — Rename to "GRN / Goods Receipt". Restore batch/expiry/MRP/cost to create form. Update detail view. Add partial receive. |
| T3 | ALL nav bars | Update navigation: add "Purchase Orders" tab, rename "Purchases" → "GRN" |

### Phase 2: Sales Flow Fixes (Critical UX)

| Task | File | Description |
|------|------|-------------|
| T4 | `sales.html` | Default to "Cash Customer" — show blue badge immediately, customer search is optional |
| T5 | `sales.html` | Product search shows stock count + batch (FEFO) in dropdown hint |
| T6 | `sales.html` | Line items show batch column (auto-selected FEFO), expired batches blocked |
| T7 | `sales.html` | Payment step: add Amount Tendered + Change fields (for Cash) |
| T8 | `sales.html` | Add "Hold" button → saves to list as "On Hold" status |
| T9 | `sales.html` | Fix Export/Import icons (▲/▼) to match other pages |
| T10 | `sales.html` | Update customer names to Telangana context |

### Phase 3: Data Consistency & Polish

| Task | File | Description |
|------|------|-------------|
| T11 | ALL pages | Standardize product codes to MED-prefix consistently |
| T12 | `overview.html` | Update stock register sample data (some non-zero values matching Products) |
| T13 | `overview.html` | Update revenue/transaction numbers to be realistic |
| T14 | `products.html` | Add note in Batches table: "Source: GRN entries" and show GRN reference |
| T15 | ALL list pages | Ensure all table rows have onclick handlers (clickable) |
| T16 | `purchases.html` | Make all invoice rows navigate to detail (not just first) |

### Phase 4: Integration Points (developer handoff notes)

| Task | File | Description |
|------|------|-------------|
| T17 | `purchase-orders.html` | PO → GRN link: "Receive against PO" button creates pre-filled GRN |
| T18 | `sales.html` | Rx link: clicking "View Rx Queue" or linking prescription auto-fills products |
| T19 | `returns.html` | Split into Sale Returns + Purchase Returns tabs clearly |
| T20 | `pharmacy-ux.js` | Wire new buttons (hold, receive, export PO) with toast feedback |

---

## 5. SAMPLE DATA REFERENCE (Consistent across all screens)

### Products (Medicines)
| Code | Name | Schedule | MRP | GST | Stock | Batch | Expiry |
|------|------|----------|-----|-----|-------|-------|--------|
| MED001 | Lignocaine HCl injection LP 1% | — | ₹85.00 | 12% | 5 | BT-2026-A1 | Jun 2028 |
| MED004 | Alprazolam tab I.P 0.25 mg | H | ₹36.10 | 5% | 25 | BT-2026-C2 | Dec 2027 |
| MED013 | Paracetamol tab 650 mg | — | ₹69.40 | 5% | 48 | BT-2026-A1 | Jun 2028 |
| MED035 | Tramadol tab 50 mg | H | ₹150.80 | 5% | 20 | BT-2026-F3 | Sep 2027 |
| MED062 | Diazepam tab I.P 5 mg | H | ₹250.70 | 5% | 12 | BT-2026-G1 | Jan 2028 |
| MED082 | Amoxycillin + Clavulanic acid tab 625 mg | — | ₹324.70 | 5% | 30 | BT-2026-D5 | Mar 2028 |
| MED016 | Diclofenac sodium spray | — | ₹230.50 | 5% | 8 | BT-2026-E1 | Sep 2027 |
| MED099 | Cetirizine tab 10 mg | — | ₹45.00 | 5% | 60 | BT-2026-H2 | Nov 2027 |
| MED105 | Pantoprazole tab 40 mg | — | ₹120.00 | 12% | 35 | BT-2026-J1 | Apr 2028 |
| MED-EXP | Metformin tab 500 mg | — | ₹55.00 | 5% | 15 | BT-2025-OLD | ~~Jan 2026~~ EXPIRED |

### Suppliers
| Code | Name | Type | Phone | GSTIN |
|------|------|------|-------|-------|
| SUP001 | Global Meds Pvt Ltd | Distributor | 040-2345-6789 | 36AABCG1234H1Z5 |
| SUP002 | Local Pharma | Wholesaler | 9876501234 | 36AABLP5678K1Z3 |
| SUP003 | MedCorp India | Manufacturer | 040-9876-5432 | 36AABCM9012L1Z1 |

### Customers
| Code | Name | Phone | Gender/Age |
|------|------|-------|------------|
| CASH | Cash Customer (Walk-in) | — | — |
| C001 | Srinivas Reddy | 9876543210 | M, 45 |
| C002 | Lakshmi Devi | 9876501234 | F, 62 |
| C003 | Rajesh Kumar | 8765432109 | M, 38 |
| C004 | Priya Sharma | 9012345678 | F, 30 |
| C005 | Anil Reddy | 7654321098 | M, 55 |

### Doctors (from prescriptions)
| Name | Specialization | Reg # |
|------|---------------|-------|
| Dr. Venkat Rao | General Physician | AP-MC-12345 |
| Dr. Swathi Reddy | Orthopedics | AP-MC-67890 |

---

## 6. DATA FLOW RULES (For developer reference)

```
┌─────────────────────────────────────────────────────────────────┐
│ STOCK SOURCE OF TRUTH = GRN (Goods Receipt) batch entries       │
│                                                                 │
│ Products.stock = SUM(GRN batches) - Sales - Damages ± Adj      │
│                                                                 │
│ At Sale time:                                                   │
│   → System shows stock from GRN batches (active + not expired) │
│   → Auto-selects FEFO (First Expiry First Out)                 │
│   → Blocks expired batches                                      │
│   → Deducts from specific batch on finalize                    │
│                                                                 │
│ At GRN time:                                                    │
│   → Creates new batch entry with expiry + cost + MRP           │
│   → Increases product stock                                     │
│   → MRP/cost auto-fill from last purchase (editable)           │
│                                                                 │
│ Purchase Order:                                                  │
│   → Only name + qty (no batch/expiry/cost — unknown)           │
│   → Export as Excel/PDF to send to supplier                    │
│   → Optional link: "Receive against PO" → pre-fills GRN       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. DECISION LOG

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | Two separate screens: Purchase Orders + GRN | Matches user's mental model ("I enter name+qty and export to supplier" vs "supplier delivered, I enter batch/expiry") |
| D2 | PO is optional (direct GRN allowed) | Emergency purchases happen without formal PO. Flexibility needed. |
| D3 | Walk-in sales default to Cash Customer | 80%+ of retail pharmacy sales are anonymous. Forcing customer selection adds friction to the primary workflow. |
| D4 | FEFO auto-selection with manual override | Regulatory best practice (sell nearest-expiry first) but pharmacist may need to override (e.g., customer needs longer shelf life) |
| D5 | Expired batch visible but blocked | Pharmacist needs to see it exists (for returns/damage recording) but cannot sell it |
| D6 | Keep online-orders.html but not in main nav | It's a future feature; main nav should stay focused on current pharmacy operations |

---

## 8. FILE MANIFEST (After implementation)

```
prototype/pharmacy-ux/
├── overview.html              (Dashboard — updated stock data)
├── products.html              (Product master + detail + batches)
├── suppliers.html             (No changes needed)
├── customers.html             (No changes needed)
├── purchase-orders.html       ★ NEW — PO list + create + detail + export
├── purchases.html             ★ REDESIGN — GRN with batch/expiry/MRP/cost
├── sales.html                 ★ MAJOR UPDATE — cash customer, stock, batch, hold
├── prescription-dispense.html (Minor polish only)
├── returns.html               (Sale returns + purchase returns tabs)
├── damages.html               (No changes needed)
├── stock-adjustments.html     (No changes needed)
├── reports.html               (No changes needed)
├── invoice-print.html         (No changes needed)
├── login.html                 (No changes needed)
├── online-orders.html         (Kept but not in main nav)
├── pharmacy-ux.js             (Updated with new button handlers)
└── WORKFLOW_PLAN.md           (This document)
```

---

## IMPLEMENTATION STATUS — ALL COMPLETE ✅

1. ✅ Create this plan document
2. ✅ Create `purchase-orders.html` (T1) — PO list + create (name+qty) + detail + export + "Receive against PO"
3. ✅ Redesign `purchases.html` → GRN (T2) — restored batch/expiry/MRP/cost, auto-fill hints, partial receive, against-PO link
4. ✅ Update all navs (T3) — split into "Purchase Orders" + "GRN" across all 12 pages
5. ✅ Fix `sales.html` (T4–T10):
   - T4: Cash Customer default (optional registered-customer selection)
   - T5: Product search shows live stock + batch (FEFO) + blocks expired
   - T6: Line items batch column (FEFO auto-select) + expired-batch blocked warning
   - T7: Amount Tendered + Change calculator (cash/split)
   - T8: Hold / Park Bill button → "On Hold" status in list
   - T9: Fixed Export/Import icons (▲/▼)
   - T10: Telangana customer names
6. ✅ Data consistency pass (T11–T16):
   - T11: All product codes standardized to MED-prefix
   - T12: Overview stock register shows realistic non-zero stock
   - T13: Overview KPIs/revenue/expiry/Schedule-H reflect real activity
   - T14: Products batches table shows Source GRN column + note
   - T15/T16: All list rows clickable
7. ✅ Integration links + JS wiring (T17–T20):
   - T17: PO detail "Receive against this PO (GRN)" → navigates to GRN
   - T18: Sales Rx link to prescription queue
   - T19: Returns split into Sale Returns + Purchase Returns (GRN refs)
   - T20: pharmacy-ux.js wires .btn-hold, .btn-export-po handlers

### Notes for the developer
- `settings.html` is an **Org Admin only** screen (pharmacy/license details, GST, invoice/print, inventory rules, compliance toggles, notifications). Developer must gate it by role — pharmacist/cashier should not see the Settings tab. It overlaps with existing `OrgConfigurations.js`; reconcile at implementation time.
- `audit-trail.html` is an **Org Admin only**, **read-only, tamper-evident** log of every create/update/delete/void/login across all modules — records who, what, when, before→after value, and IP/device. Filterable by user, module, action, date, record. Required for accountability, dispute resolution, and drug-license inspections. Developer notes: log entries must be immutable (no edit/delete from UI), written server-side on every mutating action, and retained per record-keeping norms.
- `online-orders.html` is kept and nav-updated but intentionally not in the main nav (future feature).
- All interactions are demo-only (toast feedback via `pharmacy-ux.js`). No backend calls.

### Export / Import placement (IMPORTANT — two different imports)
The global header Export/Import were removed. Scoped buttons live only where relevant:

| Screen | Buttons | Notes |
|--------|---------|-------|
| Products | Import Catalog + Export | **Catalog master only (name, MRP, GST, schedule). Does NOT add stock.** |
| Suppliers | Import + Export | Supplier master |
| Customers | Import + Export | Customer master |
| GRN | **Import from Supplier Invoice** + Export | **This import CREATES stock batches (batch/expiry/cost/qty). This is the stock source of truth.** |
| Purchase Orders | Export | PO also has Export Excel/PDF in create & detail (to send to supplier) |
| Sales | Export | Invoice list export |
| Reports | Per-tab ↓ CSV | Each report exports its own data |
| Overview, Rx Dispense, Returns, Damages, Stock Adj. | none | Operational — no bulk file exchange |

**Critical rule for the developer:**
- **Products Import = catalog only, never stock.** It seeds "what medicines exist" (the menu).
- **GRN Import = stock.** Each imported line creates a dated batch and increases inventory (stocking the fridge).
- Stock is always derived from GRN batches: `Products.stock = SUM(GRN batches) − Sales − Damages ± Adjustments`. The Products screen only *displays* derived stock; it must not let import set stock directly.
