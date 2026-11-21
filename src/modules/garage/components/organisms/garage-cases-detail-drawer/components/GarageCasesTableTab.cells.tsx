import React from "react";
import { Badge } from "@/v2/shared/ui/badge";
import {
  AlertTriangle,
  Wrench,
  Building2,
  Zap,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";

export const CLASSIFICATION_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    dot: string;
  }
> = {
  SUA_CHUA_CHUNG: {
    label: "Sửa chữa chung",
    icon: Wrench,
    dot: "#059669",
  },
  KY_GUI_NOI_BO: {
    label: "Ký gửi / Nội bộ",
    icon: Building2,
    dot: "#0D9488",
  },
  OJ_NGOAI: {
    label: "OJ Ngoài",
    icon: Zap,
    dot: "#EA580C",
  },
  KHAC: {
    label: "Khác",
    icon: HelpCircle,
    dot: "#475569",
  },
};

export function normalizeClassificationKey(key?: string | null): string {
  if (!key) return "KHAC";
  const upper = key.trim().toUpperCase();
  if (upper === "SUA_CHUA_CHUNG" || upper === "SỬA CHỮA CHUNG") {
    return "SUA_CHUA_CHUNG";
  }
  if (
    [
      "KY_GUI_NOI_BO",
      "KY_GUI",
      "NOI_BO",
      "KÝ GỬI / NỘI BỘ",
      "KÝ GỬI/ NỘI BỘ",
    ].includes(upper)
  ) {
    return "KY_GUI_NOI_BO";
  }
  if (
    [
      "OJ",
      "OJ_NGOAI",
      "XE NGOÀI (OJ)",
      "XE NGOAI (OJ)",
      "OMODA",
      "JAECOO",
    ].includes(upper)
  ) {
    return "OJ_NGOAI";
  }
  return "KHAC";
}

export function renderClassificationOrDebtorCell(
  row: GarageCaseDetailRow,
  showProfitMetrics?: boolean,
) {
  if (showProfitMetrics) {
    const key = normalizeClassificationKey(row.classification);
    const cfg = CLASSIFICATION_CONFIG[key] || CLASSIFICATION_CONFIG.KHAC;
    const Icon = cfg.icon;
    return (
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: cfg.dot }}
        />
        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="font-medium text-foreground truncate text-xs">
          {cfg.label}
        </span>
      </div>
    );
  }

  const isBH = row.payerType === "BH";
  const isEnt = row.partnerType === "enterprise";
  const badgeCls = isBH
    ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
    : isEnt
      ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-border";

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Badge
        variant="outline"
        className={cn("text-[10px] px-1 py-0 shrink-0 font-medium", badgeCls)}
      >
        {isBH ? "Bảo hiểm" : isEnt ? "DN" : "Cá nhân"}
      </Badge>
      <span className="truncate" title={row.debtorName}>
        {row.debtorName}
      </span>
    </div>
  );
}

export function renderVatCell(
  row: GarageCaseDetailRow,
  t: (key: string, fallback: string) => string = (_k, fb) => fb,
) {
  if (row.vatWarning) {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/35 text-[10px] font-bold gap-1 px-1.5 py-0.5"
      >
        <AlertTriangle className="w-2.5 h-2.5 text-amber-500 shrink-0" />
        <span>Thiếu HĐ</span>
      </Badge>
    );
  }
  if (row.invoiceNo) {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 text-[11px] font-mono px-1.5 py-0"
      >
        #{row.invoiceNo}
      </Badge>
    );
  }
  if (row.hasInvoice) {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 text-[11px] px-1.5 py-0"
      >
        {t("cases.invoice.issued", "Đã xuất")}
      </Badge>
    );
  }
  return <span className="text-muted-foreground/60 text-xs">—</span>;
}
