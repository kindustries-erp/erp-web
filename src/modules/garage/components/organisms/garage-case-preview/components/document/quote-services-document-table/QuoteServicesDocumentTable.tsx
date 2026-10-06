import React from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../../GarageCasePreview.helper";
import type { QuoteServicesDocumentTableProps } from "./QuoteServicesDocumentTable.type";

export function QuoteServicesDocumentTable({
  services,
  servicesTotalAmount,
}: QuoteServicesDocumentTableProps) {
  const { t } = useTranslation(["garage", "common"]);

  const hasInsurance = services.some((s) => s.isInsurance);
  const insuranceTotal = services
    .filter((s) => s.isInsurance)
    .reduce((sum, s) => sum + (s.insuranceApprovedAmount || s.amount || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {t("cases.quotePreview.laborSection", {
            count: services.length,
            defaultValue: `2. Nhân công & Dịch vụ (${services.length})`,
          })}
        </h3>
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-xs text-center">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <th className="p-2 w-10">{t("cases.quotePreview.stt", "STT")}</th>
              <th className="p-2 w-28 text-left">
                {t("cases.quotePreview.laborCode", "Mã C/V")}
              </th>
              <th className="p-2 text-left">
                {t("cases.quotePreview.laborName", "Tên công việc / Dịch vụ")}
              </th>
              <th className="p-2 w-12">{t("cases.quotePreview.qty", "SL")}</th>
              <th className="p-2 w-20 text-right">
                {t("cases.quotePreview.unitPrice", "Đơn giá")}
              </th>
              <th className="p-2 w-12">
                {t("cases.quotePreview.discount", "%GG")}
              </th>
              <th className="p-2 w-24 text-right">
                {t("cases.quotePreview.amount", "Thành tiền")}
              </th>
              {hasInsurance && (
                <th className="p-2 w-24 text-right text-amber-700 dark:text-amber-300">
                  {t("cases.quotePreview.insuranceApproved", "BH duyệt")}
                </th>
              )}
              <th className="p-2 w-12">
                {t("cases.quotePreview.tax", "Thuế")}
              </th>
              <th className="p-2 w-28 text-left">
                {t("cases.quotePreview.technician", "Kỹ thuật viên")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {services.map((s, i) => (
              <tr
                key={s.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="p-2 text-slate-400">{i + 1}</td>
                <td className="p-2 text-left font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {s.code}
                </td>
                <td className="p-2 text-left font-medium text-slate-800 dark:text-slate-200">
                  {s.name}
                </td>
                <td className="p-2 font-medium">{formatNumber(s.quantity)}</td>
                <td className="p-2 text-right tabular-nums">
                  {formatNumber(s.unitPrice)}
                </td>
                <td className="p-2 text-slate-500">
                  {formatNumber(s.discountRate)}%
                </td>
                <td className="p-2 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatNumber(s.amount)}
                </td>
                {hasInsurance && (
                  <td className="p-2 text-right tabular-nums text-amber-700 dark:text-amber-300 font-medium">
                    {s.isInsurance
                      ? formatNumber(s.insuranceApprovedAmount || s.amount)
                      : "---"}
                  </td>
                )}
                <td className="p-2 text-slate-500">
                  {formatNumber(s.taxRate)}%
                </td>
                <td className="p-2 text-left text-slate-600 dark:text-slate-400 truncate">
                  {s.technicianName || "---"}
                </td>
              </tr>
            ))}
            {services.length > 0 ? (
              <>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 font-semibold border-t-2 border-slate-200 dark:border-slate-700">
                  <td
                    colSpan={6}
                    className="p-2 text-right text-slate-600 dark:text-slate-400"
                  >
                    {t("cases.quotePreview.subtotalLabor", "Cộng nhân công:")}
                  </td>
                  <td className="p-2 text-right tabular-nums text-primary font-bold">
                    {formatNumber(servicesTotalAmount)}
                  </td>
                  {hasInsurance && <td className="p-2" />}
                  <td colSpan={2} className="p-2" />
                </tr>
                {hasInsurance && (
                  <tr className="bg-amber-50/50 dark:bg-amber-950/20 font-semibold border-t border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                    <td colSpan={6} className="p-2 text-right">
                      {t(
                        "cases.quotePreview.totalInsuranceLabor",
                        "Tổng BH duyệt (Nhân công):",
                      )}
                    </td>
                    <td className="p-2" />
                    <td className="p-2 text-right tabular-nums font-bold">
                      {formatNumber(insuranceTotal)}
                    </td>
                    <td colSpan={2} className="p-2" />
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td
                  colSpan={hasInsurance ? 10 : 9}
                  className="p-4 text-center text-slate-400 italic"
                >
                  {t(
                    "cases.quotePreview.noLabor",
                    "Không có nhân công - dịch vụ",
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
