import React from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../GarageCasePreview.helper";

export interface QuoteDocumentInfoGridProps {
  rawData: any;
  caseData: any;
}

export function QuoteDocumentInfoGrid({
  rawData,
  caseData,
}: QuoteDocumentInfoGridProps) {
  const { t } = useTranslation(["garage", "common"]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
      <div className="space-y-1.5">
        <div className="flex">
          <span className="w-28 text-slate-500 shrink-0">
            {t("cases.quotePreview.customer", "Khách hàng:")}
          </span>
          <span className="font-semibold uppercase text-slate-900 dark:text-slate-100">
            {rawData?.KhachHangName || caseData?.khachHangName || "---"}
          </span>
        </div>
        <div className="flex">
          <span className="w-28 text-slate-500 shrink-0">
            {t("cases.quotePreview.address", "Địa chỉ:")}
          </span>
          <span className="text-slate-700 dark:text-slate-300 truncate">
            {rawData?.DiaChiKhachHang || "---"}
          </span>
        </div>
        <div className="flex">
          <span className="w-28 text-slate-500 shrink-0">
            {t("cases.quotePreview.taxCode", "Mã số thuế:")}
          </span>
          <span className="font-mono">{rawData?.MaSoThue || "---"}</span>
        </div>
        <div className="flex">
          <span className="w-28 text-slate-500 shrink-0">
            {t("cases.quotePreview.phone", "Điện thoại:")}
          </span>
          <span className="font-mono">
            {rawData?.DienThoaiKhachHang || "---"}
          </span>
        </div>
        <div className="flex">
          <span className="w-28 text-slate-500 shrink-0">
            {t("cases.quotePreview.serviceRequest", "Yêu cầu DV:")}
          </span>
          <span className="text-slate-700 dark:text-slate-300">
            {rawData?.YeuCauDichVu || "---"}
          </span>
        </div>
      </div>
      <div className="space-y-1.5 md:border-l md:border-slate-200 dark:md:border-slate-700 md:pl-4">
        <div className="flex">
          <span className="w-24 text-slate-500 shrink-0">
            {t("cases.quotePreview.plate", "Biển số xe:")}
          </span>
          <span className="font-bold text-primary font-mono">
            {caseData?.bienSoXe || "---"}
          </span>
        </div>
        <div className="flex">
          <span className="w-24 text-slate-500 shrink-0">
            {t("cases.quotePreview.carModel", "Hãng / Dòng:")}
          </span>
          <span>
            {rawData?.HangXeName || "---"} {rawData?.DongXeName || ""}
            {rawData?.NamSanXuat ? ` (${rawData.NamSanXuat})` : ""}
          </span>
        </div>
        <div className="flex">
          <span className="w-24 text-slate-500 shrink-0">
            {t("cases.quotePreview.km", "Số KM:")}
          </span>
          <span className="font-medium font-mono">
            {formatNumber(rawData?.SoKM || rawData?.SoKMTruoc || 0)} km
          </span>
        </div>
        <div className="flex">
          <span className="w-24 text-slate-500 shrink-0">
            {t("cases.quotePreview.vin", "Số VIN:")}
          </span>
          <span className="font-mono text-slate-600 dark:text-slate-400">
            {rawData?.SoKhung || caseData?.soKhung || "---"}
          </span>
        </div>
        <div className="flex">
          <span className="w-24 text-slate-500 shrink-0">
            {t("cases.quotePreview.engineNo", "Số máy:")}
          </span>
          <span className="font-mono text-slate-600 dark:text-slate-400">
            {rawData?.SoMay || "---"}
          </span>
        </div>
      </div>
    </div>
  );
}
