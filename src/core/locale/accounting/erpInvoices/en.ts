import { erpInvoicesVi as legacyErpInvoicesVi } from "@/modules/erp-invoices-core/locales/vi";

// TODO: replace with proper English translations for remaining keys.
export const erpInvoicesEn = {
  ...legacyErpInvoicesVi,

  // View Tabs
  tabAll: "All",
  tabNew: "New",
  tabReplacement: "Replacement",
  tabAdjustment: "Adjustment",

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
