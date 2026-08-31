import { PageKey, TabInfo, SectionRoot } from "@/shared/types";

export const STATIC_TABS: Partial<Record<PageKey, TabInfo>> = {
  dashboard: { labelKey: "nav.items.dashboard", closable: false },
};

export const SECTION_ROOTS: Partial<Record<PageKey, SectionRoot>> = {
  purchasing: { labelKey: "nav.items.purchasing", group: "purchasing" },
  "inventory-dashboard": {
    labelKey: "nav.items.inventoryDashboard",
    group: "inventory",
  },
  "erp-inventory-stock": {
    labelKey: "nav.items.erpInventoryStock",
    group: "inventory",
  },
  "erp-inventory-tracking": {
    labelKey: "nav.items.erpInventoryTrackingGroup",
    group: "inventory",
  },
  "erp-inventory-tracking-parts": {
    labelKey: "nav.items.erpInventoryTrackingGroup",
    group: "inventory",
  },
  "erp-inventory-tracking-lot": {
    labelKey: "nav.items.erpInventoryTrackingGroup",
    group: "inventory",
  },
  "erp-inventory-tracking-custom": {
    labelKey: "nav.items.erpInventoryTrackingGroup",
    group: "inventory",
  },
  "erp-inventory-vouchers": {
    labelKey: "nav.items.erpInventoryVouchers",
    group: "inventory",
  },
  "mfg-items": { labelKey: "nav.items.mfgItems", group: "manufacturing" },
  "mfg-purchase-orders": {
    labelKey: "nav.items.mfgPo",
    group: "manufacturing",
  },
  "mfg-vehicles": { labelKey: "nav.items.mfgVehicles", group: "manufacturing" },
  "erp-bom": { labelKey: "nav.items.erpBom", group: "manufacturing" },
  "erp-goods-issues": {
    labelKey: "nav.items.erpGoodsIssues",
    group: "inventory",
  },
  "erp-inventory-items": {
    labelKey: "nav.items.erpInventoryItems",
    group: "inventory",
  },
  "erp-inventory-uom": {
    labelKey: "nav.items.erpInventoryUom",
    group: "settings",
  },
  "erp-inventory-item-types": {
    labelKey: "nav.items.erpInventoryItemTypes",
    group: "settings",
  },
  "erp-inventory-tracking-categories": {
    labelKey: "nav.items.erpInventoryTrackingCategories",
    group: "settings",
  },
  "erp-production": {
    labelKey: "nav.items.erpProduction",
    group: "manufacturing",
  },
  "erp-finished-goods": {
    labelKey: "breadcrumb.erpFinishedGoods",
    group: "manufacturing",
  },
  "erp-sales-orders": {
    labelKey: "nav.items.erpSalesOrders",
    group: "sales",
  },
  "sales-report-dashboard": {
    labelKey: "nav.items.salesReportDashboard",
    group: "sales",
  },
  "erp-customers": {
    labelKey: "nav.items.customers",
    group: "sales",
  },
  "after-sales": {
    labelKey: "nav.items.afterSales",
    group: "sales",
  },
  "erp-suppliers": {
    labelKey: "nav.items.suppliers",
    group: "purchasing",
  },
  "purchasing-report-dashboard": {
    labelKey: "nav.items.purchasingReportDashboard",
    group: "purchasing",
  },
  "journal-entry": {
    labelKey: "nav.items.reportJournal",
    group: "reports",
  },
  "settings-accounts": {
    labelKey: "nav.items.catalogAccounts",
    group: "accounting",
  },
  "erp-activity-logs": {
    labelKey: "nav.items.activitylog",
    group: "settings",
  },
  "erp-employees": {
    labelKey: "nav.items.erpEmployees",
    group: "hr",
  },
  "erp-users": {
    labelKey: "nav.items.users",
    group: "settings",
  },
  "erp-permissions-core": {
    labelKey: "nav.items.phanquyen",
    group: "settings",
  },
  "sys-tags": {
    labelKey: "nav.items.sysTags",
    group: "settings",
  },
  attachments: {
    labelKey: "nav.items.attachments",
    group: "settings",
  },
  "invoice-dashboard": {
    labelKey: "nav.items.invoiceDashboard",
    group: "accounting",
  },
  "erp-invoices-draft": {
    labelKey: "nav.items.erpInvoicesDraft",
    group: "accounting",
  },
  "erp-invoices": {
    labelKey: "nav.items.erpInvoices",
    group: "accounting",
  },
  "erp-invoices-in": {
    labelKey: "nav.items.erpInvoices",
    group: "accounting",
  },
  "erp-invoices-out": {
    labelKey: "nav.items.erpInvoicesOut",
    group: "accounting",
  },
  "vinfast-parts": {
    labelKey: "nav.items.vinfastParts",
    group: "vinfast",
  },
  "vinfast-parts-dashboard": {
    labelKey: "nav.items.vinfastPartsDashboard",
    group: "vinfast",
  },
  "vinfast-parts-stock": {
    labelKey: "nav.items.vinfastPartsStock",
    group: "vinfast",
  },
  "vinfast-parts-oto-stock": {
    labelKey: "nav.items.vinfastPartsOtoStock",
    group: "vinfast",
  },
  "vinfast-parts-xemay-stock": {
    labelKey: "nav.items.vinfastPartsXemayStock",
    group: "vinfast",
  },
  "settings-branch": {
    labelKey: "thietlap.tabs.chi-nhanh",
    group: "settings",
  },
  "settings-bank": {
    labelKey: "thietlap.tabs.ngan-hang",
    group: "settings",
  },
  "settings-cash-fund": {
    labelKey: "thietlap.tabs.quy",
    group: "settings",
  },
  "bank-statement": {
    labelKey: "bankStatement.bankTitle",
    group: "accounting",
  },
  "cash-statement": {
    labelKey: "bankStatement.cashTitle",
    group: "accounting",
  },
  "email-inbox": { labelKey: "nav.items.emailInbox", group: "system" },
  "cashflow-dashboard": {
    labelKey: "nav.items.cashflowDashboard",
    group: "accounting",
  },
  "garage-dashboard": {
    labelKey: "breadcrumb.garageDashboard",
    group: "garage",
  },
  "garage-cases": {
    labelKey: "breadcrumb.garageCases",
    group: "garage",
  },
  "garage-opex": {
    labelKey: "breadcrumb.garageOpex",
    group: "garage",
  },
  "garage-receivables": {
    labelKey: "breadcrumb.garageReceivables",
    group: "garage",
  },
  "garage-payables": {
    labelKey: "breadcrumb.garagePayables",
    group: "garage",
  },
  "garage-customers": {
    labelKey: "breadcrumb.garageCustomers",
    group: "garage",
  },
  "garage-partners": {
    labelKey: "breadcrumb.garagePartners",
    group: "garage",
  },
  opex: {
    labelKey: "budget:pageTitle",
    group: "accounting",
  },
};

export const BREADCRUMBS: Partial<Record<PageKey, Array<[string, string?]>>> = {
  dashboard: [["breadcrumb.dashboard"]],
  opex: [["nav.items.accounting"], ["budget:pageTitle"]],

  purchasing: [["breadcrumb.purchasing"], ["breadcrumb.purchasingOrders"]],
  "inventory-dashboard": [
    ["breadcrumb.inventory"],
    ["nav.items.inventoryDashboard"],
  ],
  "erp-inventory-stock": [
    ["breadcrumb.inventory"],
    ["breadcrumb.inventoryStock"],
  ],
  "erp-inventory-tracking": [
    ["breadcrumb.inventory"],
    ["nav.items.erpInventoryTrackingGroup"],
  ],
  "erp-inventory-tracking-parts": [
    ["breadcrumb.inventory"],
    ["nav.items.erpInventoryTrackingGroup"],
  ],
  "erp-inventory-tracking-lot": [
    ["breadcrumb.inventory"],
    ["nav.items.erpInventoryTrackingGroup"],
  ],
  "erp-inventory-tracking-custom": [
    ["breadcrumb.inventory"],
    ["nav.items.erpInventoryTrackingGroup"],
  ],
  "erp-inventory-vouchers": [
    ["breadcrumb.inventory"],
    ["breadcrumb.inventoryVouchers"],
  ],
  "mfg-items": [["breadcrumb.manufacturing"], ["breadcrumb.mfgItems"]],
  "mfg-purchase-orders": [["breadcrumb.manufacturing"], ["breadcrumb.mfgPo"]],
  "mfg-vehicles": [["breadcrumb.manufacturing"], ["breadcrumb.mfgVehicles"]],
  "erp-bom": [["breadcrumb.manufacturing"], ["breadcrumb.erpBom"]],
  "erp-production": [
    ["breadcrumb.manufacturing"],
    ["breadcrumb.erpProduction"],
  ],
  "erp-finished-goods": [
    ["breadcrumb.manufacturing"],
    ["breadcrumb.erpFinishedGoods"],
  ],
  "erp-sales-orders": [["breadcrumb.sales"], ["breadcrumb.erpSalesOrders"]],
  "sales-report-dashboard": [
    ["breadcrumb.sales"],
    ["breadcrumb.salesReportDashboard"],
  ],
  "erp-customers": [["breadcrumb.sales"], ["breadcrumb.customers"]],
  "after-sales": [["nav.items.sales"], ["nav.items.afterSales"]],
  "erp-suppliers": [["breadcrumb.purchasing"], ["breadcrumb.suppliers"]],
  "purchasing-report-dashboard": [
    ["breadcrumb.purchasing"],
    ["breadcrumb.purchasingReportDashboard"],
  ],
  "erp-goods-issues": [["breadcrumb.inventory"], ["breadcrumb.erpGoodsIssues"]],
  "erp-inventory-items": [
    ["breadcrumb.inventory"],
    ["breadcrumb.erpInventoryItems"],
  ],
  "erp-inventory-uom": [
    ["breadcrumb.settings"],
    ["breadcrumb.erpInventoryMasters"],
    ["breadcrumb.erpInventoryUom"],
  ],
  "erp-inventory-item-types": [
    ["breadcrumb.settings"],
    ["breadcrumb.erpInventoryMasters"],
    ["breadcrumb.erpInventoryItemTypes"],
  ],
  "erp-inventory-tracking-categories": [
    ["breadcrumb.settings"],
    ["breadcrumb.erpInventoryMasters"],
    ["breadcrumb.erpInventoryTrackingCategories"],
  ],
  "erp-activity-logs": [
    ["breadcrumb.settings"],
    ["nav.items.accessControl"],
    ["breadcrumb.activitylog"],
  ],
  "erp-employees": [["breadcrumb.hr"], ["breadcrumb.erpEmployees"]],
  "erp-users": [["breadcrumb.settings"], ["breadcrumb.users"]],
  "erp-permissions-core": [["breadcrumb.settings"], ["breadcrumb.phanquyen"]],
  attachments: [["breadcrumb.settings"], ["nav.items.attachments"]],
  "invoice-dashboard": [
    ["breadcrumb.accounting"],
    ["nav.items.invoiceDashboard"],
  ],
  "erp-invoices": [["breadcrumb.accounting"], ["nav.items.erpInvoices"]],
  "erp-invoices-in": [["breadcrumb.accounting"], ["breadcrumb.inbound"]],
  "erp-invoices-out": [["breadcrumb.accounting"], ["breadcrumb.outbound"]],
  "erp-invoices-draft": [
    ["breadcrumb.accounting"],
    ["nav.items.erpInvoicesDraft"],
  ],
  "vinfast-parts": [["breadcrumb.vinfast"], ["nav.items.vinfastParts"]],
  "vinfast-parts-dashboard": [
    ["breadcrumb.vinfast"],
    ["nav.items.vinfastPartsGroup"],
    ["nav.items.vinfastPartsDashboard"],
  ],
  "vinfast-parts-stock": [
    ["breadcrumb.vinfast"],
    ["nav.items.vinfastPartsGroup"],
    ["nav.items.vinfastPartsStock"],
  ],
  "vinfast-parts-oto-stock": [
    ["breadcrumb.vinfast"],
    ["nav.items.vinfastPartsGroup"],
    ["nav.items.vinfastPartsOtoStock"],
  ],
  "vinfast-parts-xemay-stock": [
    ["breadcrumb.vinfast"],
    ["nav.items.vinfastPartsGroup"],
    ["nav.items.vinfastPartsXemayStock"],
  ],
  "journal-entry": [["breadcrumb.accounting"], ["nav.items.reportJournal"]],
  "settings-accounts": [
    ["breadcrumb.accounting"],
    ["nav.items.catalogAccounts"],
  ],
  "bank-statement": [
    ["breadcrumb.accounting"],
    ["nav.items.cashflow"],
    ["bankStatement.bankTitle"],
  ],
  "cash-statement": [
    ["breadcrumb.accounting"],
    ["nav.items.cashflow"],
    ["bankStatement.cashTitle"],
  ],
  "email-inbox": [["nav.items.system"], ["nav.items.emailInbox"]],
  "cashflow-dashboard": [
    ["breadcrumb.accounting"],
    ["nav.items.cashflow"],
    ["nav.items.dashboard"],
  ],
  "settings-branch": [["breadcrumb.settings"], ["thietlap.tabs.chi-nhanh"]],
  "settings-bank": [["breadcrumb.settings"], ["thietlap.tabs.ngan-hang"]],
  "garage-dashboard": [["breadcrumb.garage"], ["breadcrumb.garageDashboard"]],
  "garage-cases": [["breadcrumb.garage"], ["breadcrumb.garageCases"]],
  "garage-opex": [["breadcrumb.garage"], ["breadcrumb.garageOpex"]],
  "garage-customers": [["breadcrumb.garage"], ["breadcrumb.garageCustomers"]],
  "garage-partners": [["breadcrumb.garage"], ["breadcrumb.garagePartners"]],
  "garage-receivables": [
    ["breadcrumb.garage"],
    ["breadcrumb.garagePartnersGroup", "garage-receivables"],
    ["breadcrumb.garageReceivables"],
  ],
  "garage-payables": [
    ["breadcrumb.garage"],
    ["breadcrumb.garagePartnersGroup", "garage-payables"],
    ["breadcrumb.garagePayables"],
  ],
};

export const DUPLICATABLE_PAGES = new Set<PageKey>([
  "erp-invoices",
  "erp-invoices-in",
  "erp-invoices-out",
]);
