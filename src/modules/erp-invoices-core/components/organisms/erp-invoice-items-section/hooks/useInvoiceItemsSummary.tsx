import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type ErpInvoiceItemRow } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";

export interface InvoiceItemsSummaryTotals {
  totalQuantity?: number;
  totalPreVatAmount?: number;
  totalVatAmount?: number;
  totalDiscountAmount?: number;
  totalAmount?: number;
  cumulativeQuantity?: number;
  cumulativePreVatAmount?: number;
  cumulativeVatAmount?: number;
  cumulativeDiscountAmount?: number;
  cumulativeTotalAmount?: number;
}

export interface UseInvoiceItemsSummaryOptions {
  items?: ErpInvoiceItemRow[];
  summary?: InvoiceItemsSummaryTotals;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export function useInvoiceItemsSummary(
  itemsOrParams?:
    | ErpInvoiceItemRow[]
    | (UseInvoiceItemsSummaryOptions & { items?: ErpInvoiceItemRow[] }),
  optionsParam?: UseInvoiceItemsSummaryOptions,
) {
  const { t } = useTranslation("erpInvoices");

  const {
    items,
    summary,
    page = 1,
    pageSize = 20,
    totalCount,
    totalPages = 1,
  } = useMemo(() => {
    if (Array.isArray(itemsOrParams)) {
      return {
        items: itemsOrParams,
        summary: optionsParam?.summary,
        page: optionsParam?.page || 1,
        pageSize: optionsParam?.pageSize || 20,
        totalCount: optionsParam?.totalCount ?? itemsOrParams.length,
        totalPages: optionsParam?.totalPages || 1,
      };
    }
    if (itemsOrParams && typeof itemsOrParams === "object") {
      return {
        items: itemsOrParams.items || [],
        summary: itemsOrParams.summary,
        page: itemsOrParams.page || 1,
        pageSize: itemsOrParams.pageSize || 20,
        totalCount:
          itemsOrParams.totalCount ?? (itemsOrParams.items?.length || 0),
        totalPages: itemsOrParams.totalPages || 1,
      };
    }
    return {
      items: [],
      summary: undefined,
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 1,
    };
  }, [itemsOrParams, optionsParam]);

  return useMemo(() => {
    if (!items || items.length === 0) return undefined;

    const subtotalQuantity = items.reduce(
      (acc: number, curr: ErpInvoiceItemRow) =>
        acc + (Number(curr.quantity) || 0),
      0,
    );
    const subtotalPreVatAmount = items.reduce(
      (acc: number, curr: ErpInvoiceItemRow) =>
        acc + (Number(curr.preVatAmount) || 0),
      0,
    );
    const subtotalVatAmount = items.reduce(
      (acc: number, curr: ErpInvoiceItemRow) =>
        acc + (Number(curr.vatAmount) || 0),
      0,
    );
    const subtotalDiscountAmount = items.reduce(
      (acc: number, curr: ErpInvoiceItemRow) =>
        acc + (Number(curr.discountAmount) || 0),
      0,
    );
    const subtotalTotalAmount = items.reduce(
      (acc: number, curr: ErpInvoiceItemRow) =>
        acc + (Number(curr.totalAmount) || 0),
      0,
    );

    const grandTotalQuantity =
      summary?.totalQuantity !== undefined
        ? Number(summary.totalQuantity)
        : subtotalQuantity;
    const grandTotalPreVatAmount =
      summary?.totalPreVatAmount !== undefined
        ? Number(summary.totalPreVatAmount)
        : subtotalPreVatAmount;
    const grandTotalVatAmount =
      summary?.totalVatAmount !== undefined
        ? Number(summary.totalVatAmount)
        : subtotalVatAmount;
    const grandTotalDiscountAmount =
      summary?.totalDiscountAmount !== undefined
        ? Number(summary.totalDiscountAmount)
        : subtotalDiscountAmount;
    const grandTotalAmount =
      summary?.totalAmount !== undefined
        ? Number(summary.totalAmount)
        : subtotalTotalAmount;

    const cumulativeQuantity =
      summary?.cumulativeQuantity !== undefined
        ? Number(summary.cumulativeQuantity)
        : page === 1
          ? subtotalQuantity
          : page >= totalPages && totalPages > 0
            ? grandTotalQuantity
            : undefined;

    const cumulativePreVatAmount =
      summary?.cumulativePreVatAmount !== undefined
        ? Number(summary.cumulativePreVatAmount)
        : page === 1
          ? subtotalPreVatAmount
          : page >= totalPages && totalPages > 0
            ? grandTotalPreVatAmount
            : undefined;

    const cumulativeVatAmount =
      summary?.cumulativeVatAmount !== undefined
        ? Number(summary.cumulativeVatAmount)
        : page === 1
          ? subtotalVatAmount
          : page >= totalPages && totalPages > 0
            ? grandTotalVatAmount
            : undefined;

    const cumulativeDiscountAmount =
      summary?.cumulativeDiscountAmount !== undefined
        ? Number(summary.cumulativeDiscountAmount)
        : page === 1
          ? subtotalDiscountAmount
          : page >= totalPages && totalPages > 0
            ? grandTotalDiscountAmount
            : undefined;

    const cumulativeTotalAmount =
      summary?.cumulativeTotalAmount !== undefined
        ? Number(summary.cumulativeTotalAmount)
        : page === 1
          ? subtotalTotalAmount
          : page >= totalPages && totalPages > 0
            ? grandTotalAmount
            : undefined;

    const cumulativeCount = (page - 1) * pageSize + items.length;

    return {
      description: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("total", { defaultValue: "Tổng cộng" })}:`}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={cumulativeCount}
          itemTitle={t("items", { defaultValue: "Dòng hàng" })}
          itemUnit={t("lines", { defaultValue: "dòng" })}
        />
      ),
      quantity: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("columns.quantity", { defaultValue: "Tổng số lượng" })}
          itemTitle={t("items", { defaultValue: "Dòng hàng" })}
          itemUnit={t("lines", { defaultValue: "dòng" })}
          subtotalQty={subtotalQuantity}
          grandTotalQty={grandTotalQuantity}
          cumulativeQty={cumulativeQuantity}
          page={page}
          totalPages={totalPages}
          valueClassName="font-medium text-foreground text-right"
        />
      ),
      preVatAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("preVatAmount", { defaultValue: "Tiền trước thuế" })}
          subtotalAmount={subtotalPreVatAmount}
          grandTotalAmount={grandTotalPreVatAmount}
          cumulativeAmount={cumulativePreVatAmount}
          page={page}
          totalPages={totalPages}
          valueClassName="font-medium text-foreground"
        />
      ),
      vatAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("vatAmount", { defaultValue: "Tiền thuế GTGT" })}
          subtotalAmount={subtotalVatAmount}
          grandTotalAmount={grandTotalVatAmount}
          cumulativeAmount={cumulativeVatAmount}
          page={page}
          totalPages={totalPages}
          valueClassName="font-medium text-foreground"
        />
      ),
      discountAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("discountAmount", { defaultValue: "Tiền chiết khấu" })}
          subtotalAmount={subtotalDiscountAmount}
          grandTotalAmount={grandTotalDiscountAmount}
          cumulativeAmount={cumulativeDiscountAmount}
          page={page}
          totalPages={totalPages}
          valueClassName="font-medium text-foreground"
        />
      ),
      totalAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("totalAmount", {
            defaultValue: "Tổng tiền thanh toán",
          })}
          subtotalAmount={subtotalTotalAmount}
          grandTotalAmount={grandTotalAmount}
          cumulativeAmount={cumulativeTotalAmount}
          page={page}
          totalPages={totalPages}
          valueClassName="font-bold text-primary"
        />
      ),
    };
  }, [items, summary, page, pageSize, totalCount, totalPages, t]);
}
