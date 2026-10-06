import React from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../GarageCasePreview.helper";
import type { QuoteLineItem } from "../../GarageCasePreview.type";

export interface QuoteDocumentTablesProps {
  parts: QuoteLineItem[];
  services: QuoteLineItem[];
  partsTotalAmount: number;
  partsTotalCost: number;
  servicesTotalAmount: number;
}

export function QuoteDocumentTables({
  parts,
  services,
  partsTotalAmount,
  partsTotalCost,
  servicesTotalAmount,
}: QuoteDocumentTablesProps) {
  const { t } = useTranslation(["garage", "common"]);

  const hasInsuranceParts = parts.some((p) => p.isInsurance);
  const partsInsuranceTotal = parts
    .filter((p) => p.isInsurance)
    .reduce((sum, p) => sum + (p.insuranceApprovedAmount || p.amount || 0), 0);

  const hasInsuranceServices = services.some((s) => s.isInsurance);
  const servicesInsuranceTotal = services
    .filter((s) => s.isInsurance)
    .reduce((sum, s) => sum + (s.insuranceApprovedAmount || s.amount || 0), 0);

  return (
    <div className="mb-6 space-y-6">
      {/* 1. Vật tư phụ tùng */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {t("cases.quotePreview.partsSection", {
              count: parts.length,
              defaultValue: `1. Vật tư & Phụ tùng (${parts.length})`,
            })}
          </h3>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
          <table className="w-full border-collapse text-xs text-center">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="p-2 w-10">
                  {t("cases.quotePreview.stt", "STT")}
                </th>
                <th className="p-2 w-28 text-left">
                  {t("cases.quotePreview.partCode", "Mã PT/VT")}
                </th>
                <th className="p-2 text-left">
                  {t("cases.quotePreview.partName", "Tên phụ tùng / vật tư")}
                </th>
                <th className="p-2 w-12">
                  {t("cases.quotePreview.qty", "SL")}
                </th>
                <th className="p-2 w-20 text-right">
                  {t("cases.quotePreview.unitPrice", "Đơn giá")}
                </th>
                <th className="p-2 w-12">
                  {t("cases.quotePreview.discount", "%GG")}
                </th>
                <th className="p-2 w-24 text-right">
                  {t("cases.quotePreview.amount", "Thành tiền")}
                </th>
                {hasInsuranceParts && (
                  <th className="p-2 w-24 text-right text-amber-700 dark:text-amber-300">
                    {t("cases.quotePreview.insuranceApproved", "BH duyệt")}
                  </th>
                )}
                <th className="p-2 w-12">
                  {t("cases.quotePreview.tax", "Thuế")}
                </th>
                <th className="p-2 w-20 text-right">
                  {t("cases.quotePreview.unitCost", "ĐG vốn")}
                </th>
                <th className="p-2 w-24 text-right">
                  {t("cases.quotePreview.totalCost", "Tổng vốn")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {parts.map((p, i) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-2 text-slate-400">{i + 1}</td>
                  <td className="p-2 text-left font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {p.code}
                  </td>
                  <td className="p-2 text-left font-medium text-slate-800 dark:text-slate-200">
                    {p.name}
                  </td>
                  <td className="p-2 font-medium">
                    {formatNumber(p.quantity)}
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    {formatNumber(p.unitPrice)}
                  </td>
                  <td className="p-2 text-slate-500">
                    {formatNumber(p.discountRate)}%
                  </td>
                  <td className="p-2 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {formatNumber(p.amount)}
                  </td>
                  {hasInsuranceParts && (
                    <td className="p-2 text-right tabular-nums text-amber-700 dark:text-amber-300 font-medium">
                      {p.isInsurance
                        ? formatNumber(p.insuranceApprovedAmount || p.amount)
                        : "---"}
                    </td>
                  )}
                  <td className="p-2 text-slate-500">
                    {formatNumber(p.taxRate)}%
                  </td>
                  <td className="p-2 text-right tabular-nums text-slate-600 dark:text-slate-400">
                    {formatNumber(p.unitCost)}
                  </td>
                  <td className="p-2 text-right font-medium tabular-nums text-slate-700 dark:text-slate-300">
                    {formatNumber(p.totalCost)}
                  </td>
                </tr>
              ))}
              {parts.length > 0 ? (
                <>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 font-semibold border-t-2 border-slate-200 dark:border-slate-700">
                    <td
                      colSpan={6}
                      className="p-2 text-right text-slate-600 dark:text-slate-400"
                    >
                      {t("cases.quotePreview.subtotalParts", "Cộng phụ tùng:")}
                    </td>
                    <td className="p-2 text-right tabular-nums text-primary font-bold">
                      {formatNumber(partsTotalAmount)}
                    </td>
                    {hasInsuranceParts && <td className="p-2" />}
                    <td colSpan={2} className="p-2" />
                    <td className="p-2 text-right tabular-nums text-slate-700 dark:text-slate-300 font-bold">
                      {formatNumber(partsTotalCost)}
                    </td>
                  </tr>
                  {hasInsuranceParts && (
                    <tr className="bg-amber-50/50 dark:bg-amber-950/20 font-semibold border-t border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                      <td colSpan={6} className="p-2 text-right">
                        {t(
                          "cases.quotePreview.totalInsuranceParts",
                          "Tổng BH duyệt (Phụ tùng):",
                        )}
                      </td>
                      <td className="p-2" />
                      <td className="p-2 text-right tabular-nums font-bold">
                        {formatNumber(partsInsuranceTotal)}
                      </td>
                      <td colSpan={3} className="p-2" />
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td
                    colSpan={hasInsuranceParts ? 11 : 10}
                    className="p-4 text-center text-slate-400 italic"
                  >
                    {t(
                      "cases.quotePreview.noParts",
                      "Không có vật tư phụ tùng",
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Nhân công - Dịch vụ */}
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
                <th className="p-2 w-10">
                  {t("cases.quotePreview.stt", "STT")}
                </th>
                <th className="p-2 w-28 text-left">
                  {t("cases.quotePreview.laborCode", "Mã C/V")}
                </th>
                <th className="p-2 text-left">
                  {t("cases.quotePreview.laborName", "Tên công việc / Dịch vụ")}
                </th>
                <th className="p-2 w-12">
                  {t("cases.quotePreview.qty", "SL")}
                </th>
                <th className="p-2 w-20 text-right">
                  {t("cases.quotePreview.unitPrice", "Đơn giá")}
                </th>
                <th className="p-2 w-12">
                  {t("cases.quotePreview.discount", "%GG")}
                </th>
                <th className="p-2 w-24 text-right">
                  {t("cases.quotePreview.amount", "Thành tiền")}
                </th>
                {hasInsuranceServices && (
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
                  <td className="p-2 font-medium">
                    {formatNumber(s.quantity)}
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    {formatNumber(s.unitPrice)}
                  </td>
                  <td className="p-2 text-slate-500">
                    {formatNumber(s.discountRate)}%
                  </td>
                  <td className="p-2 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {formatNumber(s.amount)}
                  </td>
                  {hasInsuranceServices && (
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
                    {hasInsuranceServices && <td className="p-2" />}
                    <td colSpan={2} className="p-2" />
                  </tr>
                  {hasInsuranceServices && (
                    <tr className="bg-amber-50/50 dark:bg-amber-950/20 font-semibold border-t border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                      <td colSpan={6} className="p-2 text-right">
                        {t(
                          "cases.quotePreview.totalInsuranceLabor",
                          "Tổng BH duyệt (Nhân công):",
                        )}
                      </td>
                      <td className="p-2" />
                      <td className="p-2 text-right tabular-nums font-bold">
                        {formatNumber(servicesInsuranceTotal)}
                      </td>
                      <td colSpan={2} className="p-2" />
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td
                    colSpan={hasInsuranceServices ? 10 : 9}
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
    </div>
  );
}
