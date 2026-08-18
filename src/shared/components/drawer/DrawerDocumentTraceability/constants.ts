import type { TraceabilityNodeType } from "@/shared/types/traceability";
import type { StageConfig } from "./types";

export const STAGES_CONFIG: StageConfig[] = [
  {
    key: "ORDER_STOCK",
    stageNo: 1,
    title: "1. Mua / Bán hàng & Kho",
    shortTitle: "ĐƠN HÀNG & KHO",
    types: [
      "PURCHASE_ORDER",
      "SALES_ORDER",
      "GOODS_RECEIPT",
      "GOODS_ISSUE",
      "GARAGE_CASE",
    ],
    accentBorder: "border-zinc-300/80 dark:border-zinc-700",
    badgeCls: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    bgCls: "bg-zinc-50/50 dark:bg-zinc-950/40",
  },
  {
    key: "INVOICE",
    stageNo: 2,
    title: "2. Hóa đơn VAT",
    shortTitle: "HÓA ĐƠN VAT",
    types: ["INVOICE"],
    accentBorder: "border-slate-300/80 dark:border-slate-700",
    badgeCls:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    bgCls: "bg-slate-50/50 dark:bg-slate-950/40",
  },
  {
    key: "PAYMENT",
    stageNo: 3,
    title: "3. Dòng tiền",
    shortTitle: "DÒNG TIỀN",
    types: ["BANK_TXN"],
    accentBorder: "border-slate-300/80 dark:border-slate-700",
    badgeCls:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    bgCls: "bg-slate-50/50 dark:bg-slate-950/40",
  },
  {
    key: "GENERAL_LEDGER",
    stageNo: 4,
    title: "4. Sổ cái Kế toán",
    shortTitle: "SỔ CÁI KẾ TOÁN",
    types: ["JOURNAL_ENTRY"],
    accentBorder: "border-neutral-300/80 dark:border-neutral-700",
    badgeCls:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
    bgCls: "bg-neutral-50/50 dark:bg-neutral-950/40",
  },
];

export function getStageForDocType(docType: TraceabilityNodeType): StageConfig {
  return (
    STAGES_CONFIG.find((s) => s.types.includes(docType)) || STAGES_CONFIG[0]
  );
}

export const DOC_TYPE_META: Record<
  TraceabilityNodeType,
  { label: string; fullTitle: string; badgeCls: string }
> = {
  INVOICE: {
    label: "HĐ",
    fullTitle: "Hóa đơn VAT",
    badgeCls:
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  },
  BANK_TXN: {
    label: "UNC / GBC",
    fullTitle: "Sao kê / Sổ quỹ",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  PURCHASE_ORDER: {
    label: "PO",
    fullTitle: "Đơn mua hàng (PO)",
    badgeCls:
      "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
  },
  SALES_ORDER: {
    label: "SO",
    fullTitle: "Đơn bán hàng (SO)",
    badgeCls:
      "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
  },
  GOODS_RECEIPT: {
    label: "NK",
    fullTitle: "Phiếu nhập kho (NK)",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  GOODS_ISSUE: {
    label: "XK",
    fullTitle: "Phiếu xuất kho (XK)",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  JOURNAL_ENTRY: {
    label: "GL",
    fullTitle: "Bút toán sổ cái (GL)",
    badgeCls:
      "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
  },
  GARAGE_CASE: {
    label: "RO / QTO",
    fullTitle: "Phiếu dịch vụ Garage (RO)",
    badgeCls:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
};

export const MODULE_CONFIG = DOC_TYPE_META;

export function openGlobalErpDocument(
  docType: TraceabilityNodeType,
  id: string,
) {
  let type = "";
  if (docType === "INVOICE") type = "erp_invoice";
  else if (docType === "BANK_TXN") type = "bank_transaction";
  else if (docType === "PURCHASE_ORDER") type = "erp_purchase_order";
  else if (docType === "SALES_ORDER") type = "erp_sales_order";
  else if (docType === "GOODS_RECEIPT" || docType === "GOODS_ISSUE")
    type = "inventory_voucher";
  else if (docType === "GARAGE_CASE") type = "garage_case";

  if (type) {
    window.dispatchEvent(
      new CustomEvent("open_erp_document", {
        detail: { type, id },
      }),
    );
  }
}
