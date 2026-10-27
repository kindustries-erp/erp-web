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
    accentBorder: "border-border ",
    badgeCls: "bg-muted text-foreground  ",
    bgCls: "bg-muted ",
  },
  {
    key: "INVOICE",
    stageNo: 2,
    titleKey: "v2.traceability.stage.invoice.title",
    shortTitleKey: "v2.traceability.stage.invoice.short",
    types: ["INVOICE"],
    accentBorder: "border-border ",
    badgeCls: "bg-muted text-foreground  ",
    bgCls: "bg-muted ",
  },
  {
    key: "PAYMENT",
    stageNo: 3,
    titleKey: "v2.traceability.stage.payment.title",
    shortTitleKey: "v2.traceability.stage.payment.short",
    types: ["BANK_TXN"],
    accentBorder: "border-border ",
    badgeCls: "bg-muted text-muted-fg  ",
    bgCls: "bg-muted ",
  },
  {
    key: "GENERAL_LEDGER",
    stageNo: 4,
    titleKey: "v2.traceability.stage.ledger.title",
    shortTitleKey: "v2.traceability.stage.ledger.short",
    types: ["JOURNAL_ENTRY"],
    accentBorder: "border-border ",
    badgeCls: "bg-muted text-foreground  ",
    bgCls: "bg-muted ",
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
    badgeCls: "bg-muted text-foreground border-border   ",
  },
  BANK_TXN: {
    label: "UNC / GBC",
    fullTitleKey: "v2.traceability.docType.bankTxn",
    badgeCls: "bg-muted text-muted-fg border-border   ",
  },
  PURCHASE_ORDER: {
    label: "PO",
    fullTitleKey: "v2.traceability.docType.purchaseOrder",
    badgeCls: "bg-muted text-foreground border-border   ",
  },
  SALES_ORDER: {
    label: "SO",
    fullTitleKey: "v2.traceability.docType.salesOrder",
    badgeCls: "bg-muted text-foreground border-border   ",
  },
  GOODS_RECEIPT: {
    label: "NK",
    fullTitleKey: "v2.traceability.docType.goodsReceipt",
    badgeCls: "bg-muted text-muted-fg border-border   ",
  },
  GOODS_ISSUE: {
    label: "XK",
    fullTitleKey: "v2.traceability.docType.goodsIssue",
    badgeCls: "bg-muted text-muted-fg border-border   ",
  },
  JOURNAL_ENTRY: {
    label: "GL",
    fullTitleKey: "v2.traceability.docType.journalEntry",
    badgeCls: "bg-muted text-foreground border-border   ",
  },
  GARAGE_CASE: {
    label: "RO / QTO",
    fullTitleKey: "v2.traceability.docType.garageCase",
    badgeCls: "bg-muted text-muted-fg border-border   ",
  },
  INVENTORY_ITEM: {
    label: "ITEM",
    fullTitleKey: "v2.traceability.docType.inventoryItem",
    badgeCls: "bg-muted text-foreground border-primary/30   ",
  },
  PRODUCTION_ORDER: {
    label: "LSX",
    fullTitleKey: "v2.traceability.docType.productionOrder",
    badgeCls: "bg-muted text-foreground border-primary/30   ",
  },
  BOM: {
    label: "BOM",
    fullTitleKey: "v2.traceability.docType.bom",
    badgeCls: "bg-muted text-foreground border-primary/30   ",
  },
};
