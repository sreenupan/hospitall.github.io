# Pharmacy UX Design — Final Prototype

**Target:** Telangana, India deployment  
**Source UX:** https://pharma-one-iota.vercel.app/  
**Enhanced with:** Regulatory compliance, improved user flows, Telangana-specific requirements

## Pages

| # | File | Description |
|---|------|-------------|
| 1 | `login.html` | Staff sign-in |
| 2 | `overview.html` | Dashboard: KPIs, revenue, re-order alerts, prescription queue, expiry, cash reconciliation, live stock |
| 3 | `products.html` | Product master CRUD with Schedule H/H1/X flag, detail view (spec + audit + batches) |
| 4 | `suppliers.html` | Supplier master (GSTIN, credit days, DL#) |
| 5 | `customers.html` | Walk-in customer master |
| 6 | `sales.html` | **Full interactive flow:** Customer search/add → multi-line cart with discount → payment → invoice list → detail view |
| 7 | `purchases.html` | **Full interactive flow:** List → create (multi-line with batch/expiry) → detail view |
| 8 | `returns.html` | Sale returns + Purchase returns |
| 9 | `damages.html` | Damage/breakage entry + history |
| 10 | `stock-adjustments.html` | Manual stock in/out with reason |
| 11 | `reports.html` | **6 report tabs:** Sales, Purchases, GST (CGST/SGST), Schedule H Log, Expiry Report, Stock Register |
| 12 | `prescription-dispense.html` | **Full flow:** Prescription queue → dispense with batch/qty selection → Schedule H verification → bill + payment |
| 13 | `settings.html` | Org settings: Drug License, Pharmacist, GSTIN, tax config, Schedule H policy, print settings |
| 14 | `invoice-print.html` | Print-ready A4 invoice: DL#, GSTIN, pharmacist, CGST/SGST split, batch details, Schedule H note |

## Navigation Order

```
Overview | Products | Suppliers | Customers | Sales | Purchases | Returns | Damages | Stock Adj. | Reports | Rx Dispense | Settings
```

## Sample Data

- **Pharmacy:** MedPlus Pharmacy, Banjara Hills, Hyderabad
- **Drug License:** TG/RET/2024/001234
- **Pharmacist:** Ravi Kumar, Reg# TS-PH-4521
- **GSTIN:** 36AABCU9603R1ZM (Telangana state code 36)
- **Patients:** Srinivas Reddy, Lakshmi Devi, Rajesh Kumar, Priya Sharma
- **Doctors:** Dr. Venkat Rao (GP), Dr. Swathi Reddy (Ortho)
- **Schedule H drugs:** Alprazolam, Diazepam, Tramadol
- **Prescriptions:** RX-2026-0045 (with Schedule H item)

## Regulatory Compliance Features (Telangana)

1. ✅ Drug License Number on all invoices (Form 20/21)
2. ✅ Registered Pharmacist name + Reg# on invoices
3. ✅ Schedule H/H1 drug classification + mandatory prescription verification
4. ✅ CGST/SGST split (Telangana state code 36) on invoices
5. ✅ Batch tracking with FEFO (First Expiry First Out)
6. ✅ Schedule H dispensing register (for Drug Inspector audits)
7. ✅ Stock Register report (Opening + Purchases - Sales - Damages ± Adj = Closing)
8. ✅ Expiry monitoring with financial exposure calculation
9. ✅ MRP validation (selling price must not exceed MRP)
10. ✅ Line-level discount on sales
11. ✅ Prescription linkage for audit trail
12. ✅ Day-end cash drawer reconciliation

## Key User Flows

### Walk-in Sale (sales.html)
1. Search/add customer → 2. Link prescription (optional, required for Sch H) → 3. Add products with discount → 4. Review cart (MRP, Rate, Disc, CGST/SGST) → 5. Payment → 6. Print invoice

### Prescription Dispense (prescription-dispense.html)
1. View prescription queue from doctors → 2. Click prescription to dispense → 3. Select batch + qty for each item → 4. Verify Schedule H (mandatory checkbox) → 5. Generate bill + payment → 6. Print invoice

### Purchase/GRN (purchases.html)
1. View purchase history → 2. Create new (supplier, invoice details, multi-line with batch/expiry/MRP/cost/qty) → 3. Save → stock auto-updated → 4. View detail

## For Developer

- All interactive elements work (view switching, dropdowns, form toggling)
- Sample data is consistent across pages
- Print invoice (`invoice-print.html`) uses `@media print` for clean output
- Keyboard shortcuts: ALT+N (focus product), ALT+S (finalize)
- MRP enforcement, Schedule H policy, CGST/SGST split are shown in UX — implement as backend validation
