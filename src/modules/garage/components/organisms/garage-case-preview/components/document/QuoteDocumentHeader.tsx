import React from "react";
import { useTranslation } from "react-i18next";

export interface QuoteDocumentHeaderProps {
  caseCode?: string;
  dateStr: string;
}

export function QuoteDocumentHeader({
  caseCode,
  dateStr,
}: QuoteDocumentHeaderProps) {
  const { t } = useTranslation(["garage", "common"]);

  return (
    <>
      {/* Decorative Top Stripe */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 mt-1">
        <div className="flex-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
          <h2 className="text-sm font-bold uppercase text-emerald-700 dark:text-emerald-400">
            {t(
              "cases.quotePreview.companyName",
              "CÔNG TY CỔ PHẦN GREENWAY AUTOMOTIVES",
            )}
          </h2>
          <p>
            {t(
              "cases.quotePreview.branch1",
              "CN1: 66 Phổ Quang, Phường Tân Sơn Hòa, TP. Hồ Chí Minh",
            )}
          </p>
          <p>
            {t(
              "cases.quotePreview.branch2",
              "CN2: 554 Lê Văn Lương, Phường Tân Hưng, TP. Hồ Chí Minh",
            )}
          </p>
          <p className="pt-1 font-medium text-slate-700 dark:text-slate-300">
            {t(
              "cases.quotePreview.hotline",
              "Hotline: 0853.64.65.66 & 0858.64.65.66",
            )}
          </p>
        </div>
        <div className="flex-shrink-0 text-right ml-4">
          <h1 className="text-2xl font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter">
            GREENWAY
          </h1>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-emerald-800 dark:text-emerald-400 uppercase">
            {t("cases.quotePreview.tagline", "Luxury Cars | Services")}
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6 border-t border-b border-slate-100 dark:border-slate-800 py-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg">
        <h1 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          {t("cases.quotePreview.title", "SỔ BÁO GIÁ & LỢI NHUẬN DỰ KIẾN")}
        </h1>
        <div className="flex justify-center items-center gap-6 mt-1 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {t("cases.quotePreview.caseNo", "Số phiếu:")}{" "}
            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              {caseCode || "---"}
            </strong>
          </span>
          <span>•</span>
          <span>
            {t("cases.quotePreview.date", {
              date: dateStr,
              defaultValue: `Ngày ${dateStr}`,
            })}
          </span>
        </div>
      </div>
    </>
  );
}
