import React from "react";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";
import { cn } from "@/shared/utils";
import type { AdjustmentItemsTableProps } from "./AdjustmentItemsTable.type";

export const AdjustmentItemsTable: React.FC<AdjustmentItemsTableProps> = ({
  items,
  className,
}) => {
  const { t } = useTranslation("erpInvoices");

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 space-y-2",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <Package className="w-3.5 h-3.5 text-slate-500" />
        <span>{t("Đối soát số lượng mặt hàng")}</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-[11px] text-left">
          <thead className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium">
            <tr>
              <th className="px-2.5 py-1.5">{t("Mặt hàng")}</th>
              <th className="px-2 py-1.5 text-right">{t("Gốc")}</th>
              <th className="px-2 py-1.5 text-right">{t("Đ/Chỉnh")}</th>
              <th className="px-2.5 py-1.5 text-right font-semibold text-slate-700 dark:text-slate-200">
                {t("Hiệu lực")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white/70 dark:bg-slate-900/60">
            {items.map((it, idx) => {
              const isNegative = it.adjustedDeltaQty < 0;
              return (
                <tr
                  key={`${it.itemCode || idx}`}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td
                    className="px-2.5 py-1.5 max-w-[120px] truncate"
                    title={it.description}
                  >
                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {it.description}
                    </div>
                    {it.itemCode && (
                      <div className="text-[10px] font-mono text-slate-400">
                        {it.itemCode}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-slate-600 dark:text-slate-400">
                    {it.originalQty}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-1.5 text-right font-mono font-medium",
                      isNegative
                        ? "text-rose-600 dark:text-rose-400"
                        : it.adjustedDeltaQty > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400",
                    )}
                  >
                    {it.adjustedDeltaQty > 0
                      ? `+${it.adjustedDeltaQty}`
                      : it.adjustedDeltaQty}
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {it.netEffectiveQty}
                    {it.unit && (
                      <span className="ml-1 text-[10px] font-normal text-slate-400">
                        {it.unit}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdjustmentItemsTable;
