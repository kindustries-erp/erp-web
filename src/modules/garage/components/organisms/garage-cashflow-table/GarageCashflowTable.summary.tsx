import React from "react";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import type {
  GarageCashflowVoucher,
  GarageCashflowTotals,
} from "../../../api/garageCashflowApi";

export interface BuildGarageCashflowSummaryRowParams {
  items: GarageCashflowVoucher[];
  totals?: GarageCashflowTotals;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  tabKey?: "vouchers" | "forecast";
  t: (key: string, def?: string) => string;
}

export function buildGarageCashflowSummaryRow({
  items,
  totals,
  page,
  pageSize,
  total,
  totalPages,
  tabKey = "vouchers",
  t,
}: BuildGarageCashflowSummaryRowParams): Record<string, React.ReactNode> {
  const receiptItems = items.filter((r) => r.voucherType === "RECEIPT");
  const paymentItems = items.filter((r) => r.voucherType === "PAYMENT");

  const pageThu = receiptItems.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0,
  );

  const pageChi = paymentItems.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0,
  );

  const isP1 = page === 1;
  const isLast = page >= totalPages && totalPages > 0;

  const cumThu =
    totals?.cumulativeThu != null
      ? totals.cumulativeThu
      : isP1
        ? pageThu
        : isLast
          ? totals?.grandTotalThu
          : undefined;

  const cumChi =
    totals?.cumulativeChi != null
      ? totals.cumulativeChi
      : isP1
        ? pageChi
        : isLast
          ? totals?.grandTotalChi
          : undefined;

  const grandThu =
    totals?.grandTotalThu != null
      ? totals.grandTotalThu
      : isP1 && totalPages <= 1
        ? pageThu
        : undefined;

  const grandChi =
    totals?.grandTotalChi != null
      ? totals.grandTotalChi
      : isP1 && totalPages <= 1
        ? pageChi
        : undefined;

  const cumulativeCount = Math.min((page - 1) * pageSize + items.length, total);

  return {
    voucherCode: (
      <div className="w-full flex justify-end">
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common.subtotal", "Tổng cộng")}:`}
          page={page}
          totalPages={totalPages}
          totalCount={total}
          currentPageCount={items.length}
          cumulativeCount={cumulativeCount}
          itemTitle={
            tabKey === "forecast"
              ? t("garage.cashflow.summary.forecastTitle", "Phiếu dự thu/chi")
              : t("garage.cashflow.summary.title", "Phiếu thu/chi")
          }
          itemUnit={t("garage.cashflow.summary.unit", "phiếu")}
        />
      </div>
    ),
    thu: (
      <div className="w-full flex justify-end">
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={
            tabKey === "forecast"
              ? t("garage.cashflow.columns.forecastThu", "Tiền vào (Dự thu)")
              : t("garage.cashflow.columns.thu", "Tiền vào (Thu)")
          }
          subtotalAmount={pageThu}
          cumulativeAmount={cumThu}
          grandTotalAmount={grandThu}
          page={page}
          totalPages={totalPages}
          currentPageCount={receiptItems.length}
          totalCount={total}
          valueClassName="font-bold tabular-nums text-emerald-600 dark:text-emerald-400"
        />
      </div>
    ),
    chi: (
      <div className="w-full flex justify-end">
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={
            tabKey === "forecast"
              ? t("garage.cashflow.columns.forecastChi", "Tiền ra (Dự chi)")
              : t("garage.cashflow.columns.chi", "Tiền ra (Chi)")
          }
          subtotalAmount={pageChi}
          cumulativeAmount={cumChi}
          grandTotalAmount={grandChi}
          page={page}
          totalPages={totalPages}
          currentPageCount={paymentItems.length}
          totalCount={total}
          valueClassName="font-bold tabular-nums text-rose-600 dark:text-rose-400"
        />
      </div>
    ),
  };
}
