import type {
  TraceabilityNodeType,
  TraceabilityStageConfig,
} from "../types/traceability.type";

/** Cấu hình 4 giai đoạn của luồng chứng từ (nhãn đều là i18n key) */
export const TRACEABILITY_STAGES: TraceabilityStageConfig[] = [
  {
    key: "ORDER_STOCK",
    stageNo: 1,
    titleKey: "v2.traceability.stage.orderStock.title",
    shortTitleKey: "v2.traceability.stage.orderStock.short",
    types: [
      "PURCHASE_ORDER",
      "SALES_ORDER",
      "GOODS_RECEIPT",
      "GOODS_ISSUE",
      "GARAGE_CASE",
      "INVENTORY_ITEM",
      "PRODUCTION_ORDER",
      "BOM",
    ],
    accentBorder: "border-zinc-300/80 dark:border-zinc-700",
    badgeCls: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    bgCls: "bg-zinc-50/50 dark:bg-zinc-950/40",
  },
  {
    key: "INVOICE",
    stageNo: 2,
    titleKey: "v2.traceability.stage.invoice.title",
    shortTitleKey: "v2.traceability.stage.invoice.short",
    types: ["INVOICE"],
    accentBorder: "border-slate-300/80 dark:border-slate-700",
    badgeCls:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    bgCls: "bg-slate-50/50 dark:bg-slate-950/40",
  },
  {
    key: "PAYMENT",
    stageNo: 3,
    titleKey: "v2.traceability.stage.payment.title",
    shortTitleKey: "v2.traceability.stage.payment.short",
    types: ["BANK_TXN"],
    accentBorder: "border-slate-300/80 dark:border-slate-700",
    badgeCls:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    bgCls: "bg-slate-50/50 dark:bg-slate-950/40",
  },
  {
    key: "GENERAL_LEDGER",
    stageNo: 4,
    titleKey: "v2.traceability.stage.ledger.title",
    shortTitleKey: "v2.traceability.stage.ledger.short",
    types: ["JOURNAL_ENTRY"],
    accentBorder: "border-neutral-300/80 dark:border-neutral-700",
    badgeCls:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
    bgCls: "bg-neutral-50/50 dark:bg-neutral-950/40",
  },
];

/** Nhãn ngắn, nhãn đầy đủ (i18n key) và màu badge theo loại chứng từ */
export const DOC_TYPE_META: Record<
  TraceabilityNodeType,
  { label: string; fullTitleKey: string; badgeCls: string }
> = {
  INVOICE: {
    label: "HĐ",
    fullTitleKey: "v2.traceability.docType.invoice",
    badgeCls:
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  },
  BANK_TXN: {
    label: "UNC / GBC",
    fullTitleKey: "v2.traceability.docType.bankTxn",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  PURCHASE_ORDER: {
    label: "PO",
    fullTitleKey: "v2.traceability.docType.purchaseOrder",
    badgeCls:
      "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
  },
  SALES_ORDER: {
    label: "SO",
    fullTitleKey: "v2.traceability.docType.salesOrder",
    badgeCls:
      "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
  },
  GOODS_RECEIPT: {
    label: "NK",
    fullTitleKey: "v2.traceability.docType.goodsReceipt",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  GOODS_ISSUE: {
    label: "XK",
    fullTitleKey: "v2.traceability.docType.goodsIssue",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  JOURNAL_ENTRY: {
    label: "GL",
    fullTitleKey: "v2.traceability.docType.journalEntry",
    badgeCls:
      "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
  },
  GARAGE_CASE: {
    label: "RO / QTO",
    fullTitleKey: "v2.traceability.docType.garageCase",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  INVENTORY_ITEM: {
    label: "ITEM",
    fullTitleKey: "v2.traceability.docType.inventoryItem",
    badgeCls:
      "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-700",
  },
  PRODUCTION_ORDER: {
    label: "LSX",
    fullTitleKey: "v2.traceability.docType.productionOrder",
    badgeCls:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700",
  },
  BOM: {
    label: "BOM",
    fullTitleKey: "v2.traceability.docType.bom",
    badgeCls:
      "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-700",
  },
};
