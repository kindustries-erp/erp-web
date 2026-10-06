import React from "react";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";

export function getGarageCaseRowClassName(item: any) {
  if (
    item.tinhTrangDichVu === 9 ||
    item.tenTinhTrangDichVu?.toLowerCase().includes("hủy")
  ) {
    return "opacity-40 text-muted-foreground";
  }
  return undefined;
}

export interface BuildSummaryRowParams {
  visibleCases: any[];
  profitCases: any[];
  totals?: any;
  page: number;
  pageSize: number;
  totalCases: number;
  isNgayHoanThanhVisible?: boolean;
  totalLabelCol?: string;
  t: (key: string, def?: string) => string;
}

export function buildCasesSummaryRow({
  visibleCases,
  profitCases,
  totals,
  page,
  pageSize,
  totalCases,
  isNgayHoanThanhVisible,
  totalLabelCol: customLabelCol,
  t,
}: BuildSummaryRowParams) {
  const profitMap = new Map<string, any>();
  for (const pc of profitCases) {
    const code = pc.VuViecCode || pc.SoChungTu || pc.soChungTu;
    if (code) profitMap.set(code, pc);
  }

  let totalRev = 0;
  let totalCost = 0;
  let totalProfit = 0;
  let totalReceivable = 0;
  let totalPaid = 0;
  let totalBalanceVal = 0;
  let totalRemainingPayable = 0;

  for (const item of visibleCases) {
    const pc = profitMap.get(item.soChungTu);
    const rev = Number(
      item.doanhThu ?? pc?.DoanhThu ?? item.rawData?.DoanhThu ?? 0,
    );
    const cost = Number(item.chiPhi ?? pc?.ChiPhi ?? item.rawData?.ChiPhi ?? 0);
    const profit = Number(
      item.loiNhuan ?? pc?.LoiNhuan ?? item.rawData?.LoiNhuan ?? rev - cost,
    );
    const rec = Number(
      item.tienCoThue ??
        item.tongTienThanhToan ??
        item.rawData?.TienCoThue ??
        0,
    );
    const paid = Number(
      item.tienDaThanhToan ??
        item.tienKhachDaTra ??
        item.rawData?.TienDaThanhToan ??
        0,
    );
    const bal = Number(item.tienConPhaiThanhToan ?? Math.max(0, rec - paid));
    const paidCost = Number(item.tienDaChi ?? item.rawData?.TienDaChi ?? 0);

    totalRev += rev;
    totalCost += cost;
    totalProfit += profit;
    totalReceivable += rec;
    totalPaid += paid;
    totalBalanceVal += bal;
    totalRemainingPayable += Math.max(0, cost - paidCost);
  }

  const totalLabelCol =
    customLabelCol ||
    (isNgayHoanThanhVisible ? "ngayHoanThanhCongViec" : "customer");
  const totalPages = Math.ceil(totalCases / pageSize) || 1;
  const isP1 = page === 1;

  const cumRev =
    totals?.cumulativeRevenue != null
      ? Number(totals.cumulativeRevenue)
      : isP1
        ? totalRev
        : undefined;
  const cumCost =
    totals?.cumulativeCost != null
      ? Number(totals.cumulativeCost)
      : isP1
        ? totalCost
        : undefined;
  const cumProfit =
    totals?.cumulativeProfit != null
      ? Number(totals.cumulativeProfit)
      : isP1
        ? totalProfit
        : undefined;
  const cumRec =
    totals?.cumulativeReceivable != null
      ? Number(totals.cumulativeReceivable)
      : isP1
        ? totalReceivable
        : undefined;
  const cumPaid =
    totals?.cumulativePaid != null
      ? Number(totals.cumulativePaid)
      : isP1
        ? totalPaid
        : undefined;
  const cumBal =
    totals?.cumulativeBalance != null
      ? Number(totals.cumulativeBalance)
      : isP1
        ? totalBalanceVal
        : undefined;
  const cumRemPayable =
    totals?.cumulativeRemainingPayable != null
      ? Number(totals.cumulativeRemainingPayable)
      : isP1
        ? totalRemainingPayable
        : undefined;
  const cumCount = (page - 1) * pageSize + visibleCases.length;

  const renderAmount = (
    metricTitle: string,
    subtotal: number,
    cum: number | undefined,
    grand: number | undefined,
    valueClassName?: string,
  ) => (
    <div className="w-full flex justify-end">
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={metricTitle}
        subtotalAmount={subtotal}
        cumulativeAmount={cum}
        grandTotalAmount={grand != null ? Number(grand) : subtotal}
        page={page}
        totalPages={totalPages}
        currentPageCount={visibleCases.length}
        totalCount={totalCases}
        valueClassName={valueClassName}
      />
    </div>
  );

  return {
    [totalLabelCol]: (
      <SubtotalSummaryCell
        variantType="label"
        label={`${t("cases.common.total", "Tổng cộng")}:`}
        page={page}
        totalPages={totalPages}
        totalCount={totalCases}
        currentPageCount={visibleCases.length}
        cumulativeCount={cumCount}
        itemTitle={t("cases.summary.items", "Phiếu dịch vụ")}
        itemUnit={t("cases.summary.unit", "phiếu")}
      />
    ),
    doanhThu: renderAmount(
      t("cases.columns.doanhThu", "Doanh thu"),
      totalRev,
      cumRev,
      totals?.grandTotalRevenue,
      "font-bold text-primary",
    ),
    chiPhi: renderAmount(
      t("cases.columns.chiPhi", "Chi phí"),
      totalCost,
      cumCost,
      totals?.grandTotalCost,
      "font-bold text-slate-700 dark:text-slate-300",
    ),
    loiNhuan: renderAmount(
      t("cases.columns.loiNhuan", "Lợi nhuận gộp"),
      totalProfit,
      cumProfit,
      totals?.grandTotalProfit,
      totalProfit >= 0
        ? "font-bold text-emerald-600 dark:text-emerald-400"
        : "font-bold text-rose-600 dark:text-rose-400",
    ),
    tienCoThue: renderAmount(
      t("cases.columns.totalAmount", "Tổng tiền"),
      totalReceivable,
      cumRec,
      totals?.grandTotalReceivable,
      "font-bold text-primary",
    ),
    tienDaThanhToan: renderAmount(
      t("cases.columns.paidAmount", "Đã thu"),
      totalPaid,
      cumPaid,
      totals?.grandTotalPaid,
      "font-bold text-emerald-600 dark:text-emerald-400",
    ),
    tienConPhaiThanhToan: renderAmount(
      t("cases.columns.balanceAmount", "Còn phải thu"),
      totalBalanceVal,
      cumBal,
      totals?.grandTotalBalance,
      totalBalanceVal === 0
        ? "font-bold text-emerald-600 dark:text-emerald-400"
        : "font-bold text-destructive",
    ),
    collectionProgress: renderAmount(
      t("cases.columns.collectionProgress", "Tổng phải thu"),
      totalReceivable,
      cumRec,
      totals?.grandTotalReceivable,
      "font-bold text-primary",
    ),
    costProgress: renderAmount(
      t("cases.columns.costProgress", "Tổng phải trả"),
      totalCost,
      cumCost,
      totals?.grandTotalCost,
      "font-bold text-slate-700 dark:text-slate-300",
    ),
    tienConPhaiChi: renderAmount(
      t("cases.columns.remainingPayable", "Còn phải trả"),
      totalRemainingPayable,
      cumRemPayable,
      totals?.grandTotalRemainingPayable,
      totalRemainingPayable === 0
        ? "font-bold text-emerald-600 dark:text-emerald-400"
        : "font-bold text-amber-700 dark:text-amber-400",
    ),
  };
}
