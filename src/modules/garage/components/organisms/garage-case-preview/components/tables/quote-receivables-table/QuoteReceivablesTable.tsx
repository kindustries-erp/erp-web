import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardTable } from "@/shared/components/StandardTable";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { getQuoteReceivablesTableColumns } from "./QuoteReceivablesTable.columns";
import { computeQuoteReceivableRows } from "./QuoteReceivablesTable.helper";
import type {
  QuoteReceivablesTableProps,
  QuoteReceivableRow,
} from "./QuoteReceivablesTable.type";

export function QuoteReceivablesTable({
  items: propItems,
  caseData,
  activeSettlements,
  activeLinkedInvoices,
  loading = false,
  className,
  canEditFinancial = true,
  canPerformPayment = true,
  disabledReason,
  onPaymentClick,
}: QuoteReceivablesTableProps) {
  const { t } = useTranslation(["garage", "common"]);

  const items: QuoteReceivableRow[] = useMemo(() => {
    return computeQuoteReceivableRows(
      caseData,
      activeSettlements,
      propItems,
      activeLinkedInvoices,
    );
  }, [propItems, caseData, activeSettlements, activeLinkedInvoices]);

  const effectiveCanPerform = Boolean(canPerformPayment && canEditFinancial);

  const columns = useMemo(
    () =>
      getQuoteReceivablesTableColumns(
        t,
        onPaymentClick,
        effectiveCanPerform,
        disabledReason,
      ),
    [t, onPaymentClick, effectiveCanPerform, disabledReason],
  );

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [items]);

  const totalCollected = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (Number(item.collectedAmount) || 0),
      0,
    );
  }, [items]);

  const totalRemaining = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (Number(item.remainingAmount) || 0),
      0,
    );
  }, [items]);

  const summaryRow = useMemo(() => {
    if (items.length === 0) return undefined;
    return {
      stt: (
        <SubtotalSummaryCell
          variantType="label"
          label={t("common.total", "Tổng") + ":"}
        />
      ),
      payer: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${items.length} ${t("cases.quotePreview.fin.payers", "đối tượng")}`}
        />
      ),
      label: (
        <SubtotalSummaryCell
          variantType="label"
          label={t("cases.quotePreview.fin.totalReceivable", "Tổng phải thu")}
        />
      ),
      amount: (
        <SubtotalSummaryCell
          variantType="amount"
          subtotalAmount={totalAmount}
          metricTitle={t(
            "cases.quotePreview.fin.totalReceivable",
            "Tổng phải thu",
          )}
        />
      ),
      collectedAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          subtotalAmount={totalCollected}
          metricTitle={t(
            "cases.quotePreview.fin.totalCollected",
            "Tổng đã thu",
          )}
        />
      ),
      remainingAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          subtotalAmount={totalRemaining}
          metricTitle={t(
            "cases.quotePreview.fin.totalRemaining",
            "Tổng còn lại",
          )}
        />
      ),
      linkedInvoices: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${items.reduce((sum, item) => sum + (item.linkedInvoices?.length || 0), 0)} HĐ`}
        />
      ),
    };
  }, [items, totalAmount, totalCollected, totalRemaining, t]);

  return (
    <div className={className || "w-full"}>
      <StandardTable
        tableId="garage-quote-receivables-table"
        items={items}
        columns={columns}
        getRowKey={(row) => row.id}
        variant="spreadsheet"
        loading={loading}
        minWidth={780}
        summaryRow={summaryRow}
        emptyLabel={t(
          "cases.quotePreview.noFinancialItems",
          "Chưa có chỉ số tài chính ghi nhận",
        )}
        containerClassName="min-h-0"
      />
    </div>
  );
}
