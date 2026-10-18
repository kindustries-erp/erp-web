import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Info } from "lucide-react";
import { cn } from "@/shared/utils";
import type { AdjustmentInfoDiffCardProps } from "./AdjustmentInfoDiffCard.type";

export const AdjustmentInfoDiffCard: React.FC<AdjustmentInfoDiffCardProps> = ({
  diffs,
  className,
}) => {
  const { t } = useTranslation("erpInvoices");

  if (!diffs || diffs.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
        <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>{t("Thay đổi thông tin hóa đơn")}</span>
      </div>

      <div className="space-y-1.5">
        {diffs.map((d, index) => (
          <div
            key={`${d.field}-${index}`}
            className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-100 dark:border-amber-900/40 text-[11px] space-y-1"
          >
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {d.fieldNameVi || d.field}
            </div>

            <div className="flex items-center gap-2 flex-wrap font-mono">
              <span className="line-through text-slate-400 dark:text-slate-500">
                {d.oldValue || t("(Trống)")}
              </span>
              <ArrowRight className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {d.newValue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdjustmentInfoDiffCard;
