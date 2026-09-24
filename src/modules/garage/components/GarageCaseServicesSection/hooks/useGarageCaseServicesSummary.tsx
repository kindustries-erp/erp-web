import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import type { KgaraCaseServiceRow } from "../types";
import type { CaseServicesTotals } from "@/modules/garage/api/garageApi";

export interface UseGarageCaseServicesSummaryOptions {
  items: KgaraCaseServiceRow[];
  totals?: {
    grandTotal: CaseServicesTotals;
    cumulative?: CaseServicesTotals;
  };
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function useGarageCaseServicesSummary({
  items,
  totals,
  page = 1,
  pageSize = 20,
  totalCount = 0,
  totalPages = 1,
}: UseGarageCaseServicesSummaryOptions) {
  const { t } = useTranslation("garage");

  return useMemo(() => {
    if (!items || items.length === 0) return undefined;

    const subtotalQty = items.reduce(
      (acc, r) => acc + (Number(r.soLuongHoaDon) || 0),
      0,
    );
    const subtotalPreVat = items.reduce(
      (acc, r) => acc + (Number(r.tienChuaThue) || 0),
      0,
    );
    const subtotalTotal = items.reduce(
      (acc, r) => acc + (Number(r.tienCoThue) || 0),
      0,
    );
    const subtotalLabor = items.reduce(
      (acc, r) => acc + (Number(r.tienDichVu) || 0),
      0,
    );
    const subtotalParts = items.reduce(
      (acc, r) => acc + (Number(r.tienPhuTung) || 0),
      0,
    );
    const subtotalPartsCost = items.reduce(
      (acc, r) => acc + (Number(r.giaVonPhuTung) || 0),
      0,
    );
    const subtotalDiscount = items.reduce(
      (acc, r) => acc + (Number(r.tienChietKhauCt) || 0),
      0,
    );

    const gt = totals?.grandTotal;
    const cum = totals?.cumulative;

    const grandTotalQty = gt?.soLuongHoaDon ?? subtotalQty;
    const grandTotalPreVat = gt?.tienChuaThue ?? subtotalPreVat;
    const grandTotalAmount = gt?.tienCoThue ?? subtotalTotal;
    const grandTotalLabor = gt?.tienDichVu ?? subtotalLabor;
    const grandTotalParts = gt?.tienPhuTung ?? subtotalParts;
    const grandTotalPartsCost = gt?.giaVonPhuTung ?? subtotalPartsCost;
    const grandTotalDiscount = gt?.tienChietKhauCt ?? subtotalDiscount;

    const cumulativeQty =
      cum?.soLuongHoaDon ?? (page === 1 ? subtotalQty : undefined);
    const cumulativePreVat =
      cum?.tienChuaThue ?? (page === 1 ? subtotalPreVat : undefined);
    const cumulativeAmount =
      cum?.tienCoThue ?? (page === 1 ? subtotalTotal : undefined);
    const cumulativeLabor =
      cum?.tienDichVu ?? (page === 1 ? subtotalLabor : undefined);
    const cumulativeParts =
      cum?.tienPhuTung ?? (page === 1 ? subtotalParts : undefined);
    const cumulativePartsCost =
      cum?.giaVonPhuTung ?? (page === 1 ? subtotalPartsCost : undefined);
    const cumulativeDiscount =
      cum?.tienChietKhauCt ?? (page === 1 ? subtotalDiscount : undefined);

    const cumulativeCount = (page - 1) * pageSize + items.length;

    return {
      index: (
        <SubtotalSummaryCell
          variantType="label"
          label={t("common.total", "Tổng cộng")}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={cumulativeCount}
        />
      ),
      soLuongHoaDon: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("services.columns.quantity", "Số lượng")}
          itemTitle={t("services.items", "Dòng hạng mục")}
          itemUnit="dòng"
          subtotalQty={subtotalQty}
          cumulativeQty={cumulativeQty}
          grandTotalQty={grandTotalQty}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={cumulativeCount}
        />
      ),
      tienChuaThue: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("services.columns.preVatAmount", "Tiền trước thuế")}
          subtotalAmount={subtotalPreVat}
          cumulativeAmount={cumulativePreVat}
          grandTotalAmount={grandTotalPreVat}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={cumulativeCount}
        />
      ),
      tienCoThue: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("services.columns.totalAmount", "Thành tiền")}
          subtotalAmount={subtotalTotal}
          cumulativeAmount={cumulativeAmount}
          grandTotalAmount={grandTotalAmount}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={cumulativeCount}
          valueClassName="text-primary font-bold"
        />
      ),
      tienDichVu: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("services.columns.laborCost", "Tiền công DV")}
          subtotalAmount={subtotalLabor}
          cumulativeAmount={cumulativeLabor}
          grandTotalAmount={grandTotalLabor}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={cumulativeCount}
        />
      ),
      tienPhuTung: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("services.columns.partsRevenue", "Tiền phụ tùng")}
          subtotalAmount={subtotalParts}
          cumulativeAmount={cumulativeParts}
          grandTotalAmount={grandTotalParts}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={cumulativeCount}
        />
      ),
      giaVonPhuTung: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("services.columns.partsCost", "Giá vốn PT")}
          subtotalAmount={subtotalPartsCost}
          cumulativeAmount={cumulativePartsCost}
          grandTotalAmount={grandTotalPartsCost}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={cumulativeCount}
          valueClassName="text-amber-700 dark:text-amber-400 font-semibold"
        />
      ),
      tienChietKhauCt: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("services.columns.discountAmount", "Chiết khấu")}
          subtotalAmount={subtotalDiscount}
          cumulativeAmount={cumulativeDiscount}
          grandTotalAmount={grandTotalDiscount}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={cumulativeCount}
          valueClassName="text-muted-foreground"
        />
      ),
    };
  }, [items, totals, page, pageSize, totalCount, totalPages, t]);
}
