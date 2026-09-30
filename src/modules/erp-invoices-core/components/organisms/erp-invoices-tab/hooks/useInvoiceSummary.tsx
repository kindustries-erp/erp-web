import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  type ErpInvoice,
  type ErpInvoiceTotals,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";

export interface UseInvoiceSummaryOptions {
  totals?: ErpInvoiceTotals;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export function useInvoiceSummary(
  invoicesOrParams?:
    | ErpInvoice[]
    | (UseInvoiceSummaryOptions & { invoices?: ErpInvoice[] }),
  optionsParam?: UseInvoiceSummaryOptions,
) {
  const { t } = useTranslation("erpInvoices");

  const {
    invoices,
    totals,
    page = 1,
    pageSize = 20,
    totalCount,
    totalPages = 1,
  } = useMemo(() => {
    if (Array.isArray(invoicesOrParams)) {
      return {
        invoices: invoicesOrParams,
        totals: optionsParam?.totals,
        page: optionsParam?.page || 1,
        pageSize: optionsParam?.pageSize || 20,
        totalCount: optionsParam?.totalCount ?? invoicesOrParams.length,
        totalPages: optionsParam?.totalPages || 1,
      };
    }
    if (invoicesOrParams && typeof invoicesOrParams === "object") {
      return {
        invoices: invoicesOrParams.invoices || [],
        totals: invoicesOrParams.totals,
        page: invoicesOrParams.page || 1,
        pageSize: invoicesOrParams.pageSize || 20,
        totalCount:
          invoicesOrParams.totalCount ??
          (invoicesOrParams.invoices?.length || 0),
        totalPages: invoicesOrParams.totalPages || 1,
      };
    }
    return {
      invoices: [],
      totals: undefined,
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 1,
    };
  }, [invoicesOrParams, optionsParam]);

  return useMemo(() => {
    if (!invoices || invoices.length === 0) return undefined;

    const totalPreVatAmount = invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.preVatAmount) || 0),
      0,
    );
    const totalVatAmount = invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.vatAmount) || 0),
      0,
    );
    const totalDiscountAmount = invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.discountAmount) || 0),
      0,
    );
    const totalTotalAmount = invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.totalAmount) || 0),
      0,
    );
    const totalNetOff = invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.netOffAmount) || 0),
      0,
    );
    const totalRemaining = invoices.reduce(
      (acc: number, curr: any) =>
        acc +
        ((parseFloat(curr.totalAmount) || 0) -
          (parseFloat(curr.netOffAmount) || 0)),
      0,
    );

    const grandPreVat =
      totals?.grandTotalPreVat !== undefined
        ? Number(totals.grandTotalPreVat)
        : totalPreVatAmount;
    const grandVat =
      totals?.grandTotalVat !== undefined
        ? Number(totals.grandTotalVat)
        : totalVatAmount;
    const grandDiscount =
      totals?.grandTotalDiscount !== undefined
        ? Number(totals.grandTotalDiscount)
        : totalDiscountAmount;
    const grandTotal =
      totals?.grandTotalAmount !== undefined
        ? Number(totals.grandTotalAmount)
        : totalTotalAmount;
    const grandNetOff =
      totals?.grandTotalNetOff !== undefined
        ? Number(totals.grandTotalNetOff)
        : totalNetOff;
    const grandRemaining =
      totals?.grandTotalRemaining !== undefined
        ? Number(totals.grandTotalRemaining)
        : totalRemaining;

    const cumPreVat =
      totals?.cumulativePreVat !== undefined
        ? Number(totals.cumulativePreVat)
        : undefined;
    const cumVat =
      totals?.cumulativeVat !== undefined
        ? Number(totals.cumulativeVat)
        : undefined;
    const cumDiscount =
      totals?.cumulativeDiscount !== undefined
        ? Number(totals.cumulativeDiscount)
        : undefined;
    const cumTotal =
      totals?.cumulativeTotal !== undefined
        ? Number(totals.cumulativeTotal)
        : undefined;
    const cumNetOff =
      totals?.cumulativeNetOff !== undefined
        ? Number(totals.cumulativeNetOff)
        : undefined;
    const cumRemaining =
      totals?.cumulativeRemaining !== undefined
        ? Number(totals.cumulativeRemaining)
        : undefined;

    return {
      description: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("total", { defaultValue: "Tổng cộng" })}:`}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={invoices.length}
          cumulativeCount={(page - 1) * pageSize + invoices.length}
        />
      ),
      preVatAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("preVatAmount", { defaultValue: "Tiền trước thuế" })}
          subtotalAmount={totalPreVatAmount}
          cumulativeAmount={cumPreVat}
          grandTotalAmount={grandPreVat}
          page={page}
          totalPages={totalPages}
          valueClassName="font-medium text-foreground"
        />
      ),
      vatAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("vatAmount", { defaultValue: "Tiền thuế GTGT" })}
          subtotalAmount={totalVatAmount}
          cumulativeAmount={cumVat}
          grandTotalAmount={grandVat}
          page={page}
          totalPages={totalPages}
          valueClassName="font-medium text-foreground"
        />
      ),
      discountAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("discountAmount", {
            defaultValue: "Tiền chiết khấu",
          })}
          subtotalAmount={totalDiscountAmount}
          cumulativeAmount={cumDiscount}
          grandTotalAmount={grandDiscount}
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
          subtotalAmount={totalTotalAmount}
          cumulativeAmount={cumTotal}
          grandTotalAmount={grandTotal}
          page={page}
          totalPages={totalPages}
          valueClassName="font-bold text-primary"
        />
      ),
      netOffAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("netOffAmount", { defaultValue: "Đã cấn trừ" })}
          subtotalAmount={totalNetOff}
          cumulativeAmount={cumNetOff}
          grandTotalAmount={grandNetOff}
          page={page}
          totalPages={totalPages}
          valueClassName="text-indigo-600 font-bold"
        />
      ),
      remainingAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("remainingAmount", { defaultValue: "Còn lại" })}
          subtotalAmount={totalRemaining}
          cumulativeAmount={cumRemaining}
          grandTotalAmount={grandRemaining}
          page={page}
          totalPages={totalPages}
          valueClassName={
            totalRemaining === 0
              ? "text-emerald-600 font-bold"
              : "text-[#ea580c] font-bold"
          }
        />
      ),
    };
  }, [invoices, totals, page, pageSize, totalCount, totalPages, t]);
}
