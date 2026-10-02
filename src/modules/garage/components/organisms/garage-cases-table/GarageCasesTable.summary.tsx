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

interface BuildSummaryRowParams {
  visibleCases: any[];
  profitCases: any[];
  totals?: any;
  page: number;
  pageSize: number;
  totalCases: number;
  isNgayHoanThanhVisible?: boolean;
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
  t,
}: BuildSummaryRowParams) {
  const profitMap = new Map<string, any>();
  for (const pc of profitCases) {
    if (pc.SoChungTu) profitMap.set(pc.SoChungTu, pc);
  }

  let totalRev = 0,
    totalCost = 0,
    totalProfit = 0,
    totalReceivable = 0,
    totalBalanceVal = 0,
    totalRemainingPayable = 0;

  for (const item of visibleCases) {
    const pc = profitMap.get(item.soChungTu);
    const rev = pc
      ? Number(pc.DoanhThu || 0)
      : Number(item.tongTienThanhToan || 0);
    const cost = pc ? Number(pc.ChiPhi || 0) : Number(item.tongChiPhi || 0);
    const profit = pc ? Number(pc.LoiNhuan || 0) : rev - cost;
    const paidRec = Number(item.tienKhachDaTra || 0);
    const paidCost = Number(item.tienDaChi || 0);

    totalRev += rev;
    totalCost += cost;
    totalProfit += profit;
    totalReceivable += rev;
    totalBalanceVal += Math.max(0, rev - paidRec);
    totalRemainingPayable += Math.max(0, cost - paidCost);
  }

  const totalLabelCol =
    isNgayHoanThanhVisible !== false ? "ngayHoanThanhCongViec" : "customer";
  const totalPages = Math.ceil(totalCases / pageSize) || 1;

  const cumRev =
    totals?.cumulativeRevenue !== undefined
      ? Number(totals.cumulativeRevenue)
      : page === 1
        ? totalRev
        : undefined;
  const cumCost =
    totals?.cumulativeCost !== undefined
      ? Number(totals.cumulativeCost)
      : page === 1
        ? totalCost
        : undefined;
  const cumProfit =
    totals?.cumulativeProfit !== undefined
      ? Number(totals.cumulativeProfit)
      : page === 1
        ? totalProfit
        : undefined;
  const cumRec =
    totals?.cumulativeReceivable !== undefined
      ? Number(totals.cumulativeReceivable)
      : page === 1
        ? totalReceivable
        : undefined;
  const cumBal =
    totals?.cumulativeBalance !== undefined
      ? Number(totals.cumulativeBalance)
      : page === 1
        ? totalBalanceVal
        : undefined;
  const cumRemPayable =
    totals?.cumulativeRemainingPayable !== undefined
      ? Number(totals.cumulativeRemainingPayable)
      : page === 1
        ? totalRemainingPayable
        : undefined;
  const cumCount = (page - 1) * pageSize + visibleCases.length;

  const renderAmount = (
    metricTitle: string,
    subtotal: number,
    cum: number | undefined,
    grand: number,
    valueClassName?: string,
  ) => (
    <div className="w-full flex justify-end">
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={metricTitle}
        subtotalAmount={subtotal}
        cumulativeAmount={cum}
        grandTotalAmount={grand}
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
      totals?.grandTotalRevenue !== undefined
        ? Number(totals.grandTotalRevenue)
        : totalRev,
      "font-bold text-primary",
    ),
    chiPhi: renderAmount(
      t("cases.columns.chiPhi", "Chi phí"),
      totalCost,
      cumCost,
      totals?.grandTotalCost !== undefined
        ? Number(totals.grandTotalCost)
        : totalCost,
      "font-bold text-slate-700 dark:text-slate-300",
    ),
    loiNhuan: renderAmount(
      t("cases.columns.loiNhuan", "Lợi nhuận gộp"),
      totalProfit,
      cumProfit,
      totals?.grandTotalProfit !== undefined
        ? Number(totals.grandTotalProfit)
        : totalProfit,
      totalProfit >= 0
        ? "font-bold text-emerald-600 dark:text-emerald-400"
        : "font-bold text-rose-600 dark:text-rose-400",
    ),
    collectionProgress: renderAmount(
      t("cases.columns.collectionProgress", "Tổng phải thu"),
      totalReceivable,
      cumRec,
      totals?.grandTotalReceivable !== undefined
        ? Number(totals.grandTotalReceivable)
        : totalReceivable,
      "font-bold text-primary",
    ),
    tienConPhaiThanhToan: renderAmount(
      t("cases.columns.remainingReceivable", "Còn phải thu"),
      totalBalanceVal,
      cumBal,
      totals?.grandTotalBalance !== undefined
        ? Number(totals.grandTotalBalance)
        : totalBalanceVal,
      totalBalanceVal === 0
        ? "font-bold text-emerald-600 dark:text-emerald-400"
        : "font-bold text-destructive",
    ),
    costProgress: renderAmount(
      t("cases.columns.costProgress", "Tổng phải trả"),
      totalCost,
      cumCost,
      totals?.grandTotalCost !== undefined
        ? Number(totals.grandTotalCost)
        : totalCost,
      "font-bold text-slate-700 dark:text-slate-300",
    ),
    tienConPhaiChi: renderAmount(
      t("cases.columns.remainingPayable", "Còn phải trả"),
      totalRemainingPayable,
      cumRemPayable,
      totals?.grandTotalRemainingPayable !== undefined
        ? Number(totals.grandTotalRemainingPayable)
        : totalRemainingPayable,
      totalRemainingPayable === 0
        ? "font-bold text-emerald-600 dark:text-emerald-400"
        : "font-bold text-amber-700 dark:text-amber-400",
    ),
  };
}
