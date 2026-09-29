import React from "react";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { money } from "@/shared/utils/format";
import { useTranslation } from "react-i18next";

export interface GarageCaseBusinessPerformanceSectionProps {
  caseData: any;
  grossProfit?: any;
}

export function GarageCaseBusinessPerformanceSection({
  caseData,
  grossProfit,
}: GarageCaseBusinessPerformanceSectionProps) {
  const { t } = useTranslation("garage");

  if (!caseData) return null;

  const revenueAmount = Number(
    grossProfit?.DoanhThu ??
      caseData.doanhThu ??
      caseData.rawData?.DoanhThu ??
      caseData.rawData?.TongTienHang ??
      0,
  );
  const totalCostAmount = Number(
    grossProfit?.ChiPhi ?? caseData.chiPhi ?? caseData.rawData?.ChiPhi ?? 0,
  );
  const grossProfitAmount = Number(
    grossProfit?.LoiNhuan ??
      caseData.loiNhuan ??
      caseData.rawData?.LoiNhuan ??
      revenueAmount - totalCostAmount,
  );
  const profitMargin =
    grossProfit?.BienLoiNhuan != null
      ? Number(grossProfit.BienLoiNhuan)
      : revenueAmount > 0
        ? Number(((grossProfitAmount / revenueAmount) * 100).toFixed(1))
        : 0;

  if (revenueAmount === 0 && totalCostAmount === 0 && !grossProfit) {
    return null;
  }

  return (
    <DrawerSection
      title={t(
        "cases.drawer.businessPerformance",
        "Hiệu quả kinh doanh & Lợi nhuận",
      )}
      collapsible
      defaultCollapsed={false}
    >
      <DrawerRow
        label={t("cases.drawer.preTaxRevenue", "Doanh thu (chưa thuế)")}
        value={money(revenueAmount)}
      />
      <DrawerRow
        label={t("cases.drawer.totalCost", "Tổng chi phí vụ việc")}
        cls="text-slate-700 dark:text-slate-300 font-medium"
        value={money(totalCostAmount)}
      />
      {Number(grossProfit?.GiaVonPhuTung || 0) > 0 && (
        <DrawerRow
          label={t("cases.drawer.partCost", "↳ Giá vốn phụ tùng")}
          cls="text-xs text-slate-500 pl-2"
          value={money(Number(grossProfit.GiaVonPhuTung))}
        />
      )}
      {Number(grossProfit?.ChiPhiGiaCongNgoai || 0) > 0 && (
        <DrawerRow
          label={t("cases.drawer.subcontractCost", "↳ Gia công ngoài")}
          cls="text-xs text-slate-500 pl-2"
          value={money(Number(grossProfit.ChiPhiGiaCongNgoai))}
        />
      )}
      {Number(grossProfit?.ChiPhiHoaHongGDV || 0) > 0 && (
        <DrawerRow
          label={t(
            "cases.drawer.commissionSurveyor",
            "↳ Hoa hồng Giám định viên",
          )}
          cls="text-xs text-slate-500 pl-2"
          value={money(Number(grossProfit.ChiPhiHoaHongGDV))}
        />
      )}
      {Number(grossProfit?.ChiPhiHoaHongMG || 0) > 0 && (
        <DrawerRow
          label={t("cases.drawer.commissionBroker", "↳ Hoa hồng Môi giới")}
          cls="text-xs text-slate-500 pl-2"
          value={money(Number(grossProfit.ChiPhiHoaHongMG))}
        />
      )}
      <DrawerRow
        label={t("cases.drawer.grossProfit", "Lợi nhuận gộp")}
        cls="text-slate-900 dark:text-slate-100 font-bold"
        value={money(grossProfitAmount)}
      />
      {revenueAmount > 0 && (
        <DrawerRow
          label={t("cases.drawer.profitMargin", "Biên lợi nhuận")}
          cls={
            profitMargin >= 0
              ? "text-slate-900 dark:text-slate-100 font-bold font-mono"
              : "text-rose-600 font-bold font-mono"
          }
          value={`${profitMargin >= 0 ? "+" : ""}${profitMargin}%`}
        />
      )}
      {grossProfit?.LoiNhuanCoThue != null && (
        <DrawerRow
          label={t("cases.drawer.grossProfitTax", "Lợi nhuận gộp có thuế")}
          cls="text-slate-800 dark:text-slate-200 font-semibold"
          value={money(Number(grossProfit.LoiNhuanCoThue || 0))}
        />
      )}
    </DrawerSection>
  );
}
