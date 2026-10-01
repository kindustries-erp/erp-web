import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/utils";
import type { AdjustmentTypeBadgeProps } from "./AdjustmentTypeBadge.type";

export const AdjustmentTypeBadge: React.FC<AdjustmentTypeBadgeProps> = ({
  role,
  taxInvoiceStatus,
  className,
}) => {
  const { t } = useTranslation("erpInvoices");

  const getBadgeConfig = () => {
    if (taxInvoiceStatus === 2) {
      return {
        label: t("Hóa đơn thay thế"),
        classes:
          "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
      };
    }

    switch (role) {
      case "ADJUSTING":
        return {
          label: t("Hóa đơn điều chỉnh"),
          classes:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        };
      case "ORIGINAL":
        return {
          label: t("Hóa đơn bị điều chỉnh"),
          classes:
            "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
        };
      case "FULL_CANCELLATION":
        return {
          label: t("Đã bị hủy toàn bộ"),
          classes:
            "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
        };
      case "REPLACEMENT":
        return {
          label: t("Hóa đơn thay thế"),
          classes:
            "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
        };
      default:
        return {
          label: t("Hóa đơn gốc"),
          classes:
            "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800",
        };
    }
  };

  const { label, classes } = getBadgeConfig();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border shadow-2xs transition-colors",
        classes,
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      {label}
    </span>
  );
};

export default AdjustmentTypeBadge;
