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

export interface NodeVisualMeta {
  label: string;
  subLabel?: string;
  fullTitle: string;
  badgeCls: string;
  cardBorderCls?: string;
  isReceipt?: boolean;
  isPayment?: boolean;
  isInvoiceIn?: boolean;
  isInvoiceOut?: boolean;
  amountCls?: string;
  amountPrefix?: string;
}

export function isManualSettlementNode(node: {
  id?: string;
  docType?: string;
  docNo?: string;
  title?: string;
  partnerName?: string | null;
  sourceChannel?: string;
}) {
  if (node.docType !== "BANK_TXN") return false;
  if (node.id?.startsWith("manual-")) return true;
  if (node.sourceChannel === "OFF_SYSTEM_MANUAL") return true;
  if (node.docNo?.includes("NGOAI")) return true;
  const str = `${node.title || ""} ${node.partnerName || ""}`.toLowerCase();
  return (
    str.includes("ngoài sổ sách") ||
    str.includes("ngoài erp") ||
    str.includes("tiền ngoài")
  );
}

export function getNodeVisualMeta(node: {
  id?: string;
  docType: TraceabilityNodeType;
  docNo?: string;
  title?: string;
  partnerName?: string | null;
  metadata?: any;
  sourceChannel?: string;
}): NodeVisualMeta {
  const dt = node.docType;

  // 1. INVOICE:
  // - HĐ Mua (Chi tiền) đồng bộ màu Cam (Orange #ea580c) giống UNC / Phiếu Chi
  // - HĐ Bán (Thu tiền) đồng bộ màu Xanh Lá (Emerald) giống GBC / Phiếu Thu
  if (dt === "INVOICE") {
    const isOut =
      node.metadata?.direction === "OUT" ||
      node.metadata?.linkType === "OUT" ||
      node.title?.toLowerCase().includes("đầu ra") ||
      node.title?.toLowerCase().includes("bán");

    if (isOut) {
      return {
        label: "HĐ BÁN",
        subLabel: "Đầu ra",
        fullTitle: "Hóa đơn bán ra (Đầu ra - Thu tiền)",
        badgeCls:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
        cardBorderCls: "border-l-4 border-l-emerald-500",
        isInvoiceOut: true,
      };
    }

    return {
      label: "HĐ MUA",
      subLabel: "Đầu vào",
      fullTitle: "Hóa đơn mua vào (Đầu vào - Chi tiền)",
      badgeCls:
        "bg-orange-50 text-[#ea580c] border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
      cardBorderCls: "border-l-4 border-l-[#ea580c]",
      isInvoiceIn: true,
    };
  }

  // 2. BANK_TXN: Phân biệt Thu (Emerald) vs Chi (Orange #ea580c) theo chuẩn Cashflow Dashboard
  if (dt === "BANK_TXN") {
    const isManual = isManualSettlementNode(node);
    const titleLower = (node.title || "").toLowerCase();
    const docNoUpper = (node.docNo || "").toUpperCase();

    const isReceipt =
      node.metadata?.isCredit === true ||
      node.metadata?.settlementType === "RECEIPT" ||
      docNoUpper.startsWith("GBC") ||
      docNoUpper.includes("THU") ||
      titleLower.includes("báo có") ||
      titleLower.includes("thu") ||
      titleLower.includes("khoản thu");

    if (isManual) {
      if (isReceipt) {
        return {
          label: "THU NGOÀI",
          subLabel: "Ngoài sổ",
          fullTitle: "Khoản thu ngoài ERP (Nội bộ)",
          badgeCls:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
          cardBorderCls: "border-l-4 border-l-emerald-500",
          isReceipt: true,
          amountCls: "text-emerald-600 dark:text-emerald-400 font-bold",
          amountPrefix: "+",
        };
      }
      return {
        label: "CHI NGOÀI",
        subLabel: "Ngoài sổ",
        fullTitle: "Khoản chi ngoài ERP (Nội bộ)",
        badgeCls:
          "bg-orange-50 text-[#ea580c] border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
        cardBorderCls: "border-l-4 border-l-[#ea580c]",
        isPayment: true,
        amountCls: "text-[#ea580c] dark:text-orange-400 font-bold",
        amountPrefix: "-",
      };
    }

    const isCash =
      node.metadata?.sourceType === "CASH" ||
      titleLower.includes("sổ quỹ") ||
      titleLower.includes("phiếu");

    if (isReceipt) {
      return {
        label: isCash ? "PHIẾU THU" : "GBC",
        subLabel: isCash ? "Tiền mặt" : "Báo có",
        fullTitle: isCash
          ? "Phiếu thu tiền mặt"
          : "Giấy báo có ngân hàng (GBC)",
        badgeCls:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
        cardBorderCls: "border-l-4 border-l-emerald-500",
        isReceipt: true,
        amountCls: "text-emerald-600 dark:text-emerald-400 font-bold",
        amountPrefix: "+",
      };
    }

    return {
      label: isCash ? "PHIẾU CHI" : "UNC",
      subLabel: isCash ? "Tiền mặt" : "Ủy nhiệm chi",
      fullTitle: isCash ? "Phiếu chi tiền mặt" : "Ủy nhiệm chi ngân hàng (UNC)",
      badgeCls:
        "bg-orange-50 text-[#ea580c] border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
      cardBorderCls: "border-l-4 border-l-[#ea580c]",
      isPayment: true,
      amountCls: "text-[#ea580c] dark:text-orange-400 font-bold",
      amountPrefix: "-",
    };
  }

  // 3. Các loại chứng từ khác
  const defaultMeta = DOC_TYPE_META[dt] || {
    label: dt,
    fullTitle: dt,
    badgeCls: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return {
    label: defaultMeta.label,
    fullTitle: defaultMeta.fullTitle,
    badgeCls: defaultMeta.badgeCls,
  };
}

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
