import { erpInvoicesVi as legacyErpInvoicesVi } from "@/modules/erp-invoices-core/locales/vi";

export const erpInvoicesEn = {
  ...legacyErpInvoicesVi,

  // Page Actions & Header
  reload: "Reload",
  importXml: "Import XML",
  createInvoice: "Create Invoice",
  filters: "All Statuses",
  portalTab: "E-Invoice Portal",
  fetchList: "Fetch List",
  importToErp: "Import to ERP",
  tokenLabel: "Bearer token",
  dateFromLabel: "From date",
  dateToLabel: "To date",
  presetToday: "Today",
  presetThisMonth: "This month",
  presetLastMonth: "Last month",
  presetThisQuarter: "This quarter",
  presetThisYear: "This year",
  presetAll: "All",
  clearFilter: "Clear filters",
  apply: "Apply",
  invoiceTypeLabel: "Invoice Type",
  purchaseType: "Inbound (IN)",
  saleType: "Outbound (OUT)",
  fetchSuccess: "Fetched {{count}} invoices",
  importSuccess:
    "Imported {{imported}} invoices, skipped {{skipped}} duplicates",
  selectAll: "Select all",
  deselectAll: "Deselect",
  syncInvoices: "Sync Invoices",
  exportExcel: "Export Excel",
  loginTaxPortal: "Tax Portal Login",
  invoiceDesc: "Manage electronic invoices and tax documents",
  tag: "Tag",
  allTags: "All tags",

  // View Tabs
  inbound: "Inbound Invoices",
  outbound: "Outbound Invoices",
  tabAll: "All",
  tabNew: "New",
  tabReplacement: "Replacement",
  tabAdjustment: "Adjustment",

  // Columns & Fields
  attachments: "Docs",
  invoiceDate: "Inv Date",
  serialNo: "Serial",
  invoiceNo: "Inv No",
  seller: "Seller",
  buyer: "Buyer",
  partner: "Partner",
  taxCode: "Tax Code",
  taxInvoiceType: "Inv Type",
  taxInvoiceStatus: "GDT Status",
  taxProcessStatus: "Tax Result",
  preVatAmount: "Pre-VAT",
  vatRate: "VAT Rate",
  vatAmount: "VAT Amount",
  discountAmount: "Discount",
  totalAmount: "Total Amount",
  description: "Description",
  settlementOrder: "Settlement Order",
  licensePlate: "License Plate",
  netOffAmount: "Settled",
  "invoice.columns.remainingAmount": "Remaining",
  postingStatus: "Posting",
  "invoice.columns.isValid": "Valid Invoice",
  "invoice.isValid.true": "Valid",
  "invoice.isValid.false": "Invalid",
  branch: "Branch",
  invoiceCategory: "Category",
  "invoice.columns.notes": "Notes",

  // Attachments Popover & Tooltips
  downloadXml: "Download XML",
  noXml: "No XML/ZIP file",
  pdfList: "PDF Files List",
  noPdf: "No PDF file",

  // Statuses
  statusDraft: "Draft",
  statusConfirmed: "Confirmed",
  statusCancelled: "Cancelled",

  // Actions & Groups
  groupTraCuu: "Lookup",
  groupThaoTac: "Actions",
  actionDetail: "Detail",
  actionDownloadXml: "Download XML",
  actionDownloadPdf: "Download PDF",
  actionEdit: "Edit",
  actionDelete: "Delete",
  actionCancel: "Cancel",
  actionSaveDraft: "Save Draft",
  actionCreate: "Create New",
  actionSaveChange: "Save Changes",
  actionSaving: "Saving...",
  actionClose: "Close",
  actionNetOff: "Net-Off Statement",
  netOffSuccess: "Successfully netted off statement",
  netOffError: "Failed to net off statement",

  // Modal Text
  emptyData: "No invoices found.",
  drawerTitleNew: "Create New Invoice",
  drawerTitleEdit: "Edit: {{invoiceNo}}",
  drawerTitleView: "Detail: {{invoiceNo}}",
  generalInfo: "General Information",
  sellerInfo: "Seller Information",
  buyerInfo: "Buyer Information",
  taxTotalInfo: "Tax & Totals",
  itemsSection: "Invoice Line Items",

  // Bulk Edit Drawer
  bulkActions: "Actions",
  bulkAssignAll: "Bulk Assign",

  // Sinvoice Draft Sync - toasts & notifications
  "sinvoiceDraft.syncSuccess":
    "Updated: +{{added}} new, -{{removed}} deleted. Total: {{synced}}",
  "sinvoiceDraft.syncFail": "Sync failed",
  "sinvoiceDraft.notifyTitle": "Draft invoices sync completed",
  "sinvoiceDraft.notifyMessage":
    "Viettel draft invoices updated: +{{added}} new, -{{removed}} deleted. Current total: {{syncedCount}} drafts.",

  // Smart Net-Off & Settlement Suggestions
  "smartSuggestion.title": "Smart Reconciliation Suggestions",
  "smartSuggestion.searching": "Searching...",
  "smartSuggestion.noMatch":
    "No exact matching transactions found for this invoice. You can search manually in the list below.",
  "smartSuggestion.accept": "Accept Suggestion",
  "smartSuggestion.viewDetail": "Click to view statement details",
  "smartSuggestion.deleteTxn": "Remove this transaction",
  "smartSuggestion.partner": "Partner:",
  "smartSuggestion.netOffLabel": "Net-off:",
  "smartSuggestion.badge.perfect": "Amount + Inv No + Partner",
  "smartSuggestion.badge.high": "Amount + Inv No",
  "smartSuggestion.badge.likely": "Amount + Partner",
  "smartSuggestion.badge.possible": "Exact Amount Only",
  "smartSuggestion.badge.noticeStrong": "Inv No + Partner (Diff Amount)",
  "smartSuggestion.badge.notice": "Inv No Match (Diff Amount)",
  "smartSuggestion.warning.possible":
    "Exact amount match only, please verify carefully",
  "smartSuggestion.warning.overRemaining":
    "Warning: Total net-off amount ({{current}}) exceeds invoice remaining amount ({{target}}). Please adjust before confirming.",
};
