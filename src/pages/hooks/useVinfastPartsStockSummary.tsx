import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";

export interface VinfastPartsStockSummaryTotals {
  totalQtyIn?: number;
  totalQtyOut?: number;
  totalQtyBalance?: number;
  cumulativeQtyIn?: number;
  cumulativeQtyOut?: number;
  cumulativeQtyBalance?: number;
}

export interface UseVinfastPartsStockSummaryOptions {
  items?: any[];
  summary?: VinfastPartsStockSummaryTotals;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export function useVinfastPartsStockSummary(
  options: UseVinfastPartsStockSummaryOptions,
) {
  const { t } = useTranslation(["vinfastParts", "common"]);

  const {
    items = [],
    summary,
    page = 1,
    pageSize = 50,
    totalCount,
    totalPages = 1,
  } = options;

  return useMemo(() => {
    if (!items || items.length === 0) return undefined;

    const subtotalQtyIn = items.reduce(
      (acc: number, cur: any) => acc + (Number(cur.qtyIn) || 0),
      0,
    );
    const subtotalQtyOut = items.reduce(
      (acc: number, cur: any) => acc + (Number(cur.qtyOut) || 0),
      0,
    );
    const subtotalQtyBalance = items.reduce(
      (acc: number, cur: any) => acc + (Number(cur.qtyBalance) || 0),
      0,
    );

    const grandTotalQtyIn =
      summary?.totalQtyIn !== undefined
        ? Number(summary.totalQtyIn)
        : subtotalQtyIn;
    const grandTotalQtyOut =
      summary?.totalQtyOut !== undefined
        ? Number(summary.totalQtyOut)
        : subtotalQtyOut;
    const grandTotalQtyBalance =
      summary?.totalQtyBalance !== undefined
        ? Number(summary.totalQtyBalance)
        : subtotalQtyBalance;

    const cumulativeQtyIn =
      summary?.cumulativeQtyIn !== undefined
        ? Number(summary.cumulativeQtyIn)
        : page === 1
          ? subtotalQtyIn
          : page >= totalPages && totalPages > 0
            ? grandTotalQtyIn
            : undefined;

    const cumulativeQtyOut =
      summary?.cumulativeQtyOut !== undefined
        ? Number(summary.cumulativeQtyOut)
        : page === 1
          ? subtotalQtyOut
          : page >= totalPages && totalPages > 0
            ? grandTotalQtyOut
            : undefined;

    const cumulativeQtyBalance =
      summary?.cumulativeQtyBalance !== undefined
        ? Number(summary.cumulativeQtyBalance)
        : page === 1
          ? subtotalQtyBalance
          : page >= totalPages && totalPages > 0
            ? grandTotalQtyBalance
            : undefined;

    return {
      name: (
        <div className="text-right w-full font-semibold">
          {t("common:total", "Tổng cộng")}:
        </div>
      ),
      qtyIn: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("vinfastParts:TOTAL_IN", "Tổng Nhập")}
          subtotalQty={subtotalQtyIn}
          grandTotalQty={grandTotalQtyIn}
          cumulativeQty={cumulativeQtyIn}
          page={page}
          totalPages={totalPages}
          valueClassName="font-semibold text-emerald-700 text-right"
        />
      ),
      qtyOut: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("vinfastParts:TOTAL_OUT", "Tổng Xuất")}
          subtotalQty={subtotalQtyOut}
          grandTotalQty={grandTotalQtyOut}
          cumulativeQty={cumulativeQtyOut}
          page={page}
          totalPages={totalPages}
          valueClassName="font-semibold text-rose-700 text-right"
        />
      ),
      qtyBalance: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("vinfastParts:BALANCE", "Tồn cuối")}
          subtotalQty={subtotalQtyBalance}
          grandTotalQty={grandTotalQtyBalance}
          cumulativeQty={cumulativeQtyBalance}
          page={page}
          totalPages={totalPages}
          valueClassName="font-bold text-slate-800 dark:text-slate-100 text-right"
        />
      ),
    };
  }, [items, summary, page, pageSize, totalCount, totalPages, t]);
}
