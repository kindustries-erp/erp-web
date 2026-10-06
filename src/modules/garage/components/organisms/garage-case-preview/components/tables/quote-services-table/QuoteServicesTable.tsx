import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardTable } from "@/shared/components/StandardTable";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { getQuoteServicesTableColumns } from "./QuoteServicesTable.columns";
import type { QuoteServicesTableProps } from "./QuoteServicesTable.type";

export function QuoteServicesTable({
  lines,
  loading = false,
  className,
  onPaymentClick,
  canEditFinancial = true,
}: QuoteServicesTableProps) {
  const { t } = useTranslation(["garage", "common"]);

  const columns = useMemo(
    () => getQuoteServicesTableColumns(t, onPaymentClick, canEditFinancial),
    [t, onPaymentClick, canEditFinancial],
  );

  const { totalQty, totalAmount, totalCost } = useMemo(() => {
    return lines.reduce(
      (acc, item) => ({
        totalQty: acc.totalQty + (Number(item.quantity) || 0),
        totalAmount: acc.totalAmount + (Number(item.amount) || 0),
        totalCost: acc.totalCost + (Number(item.totalCost) || 0),
      }),
      { totalQty: 0, totalAmount: 0, totalCost: 0 },
    );
  }, [lines]);

  const summaryRow = useMemo(() => {
    if (lines.length === 0) return undefined;
    return {
      stt: (
        <SubtotalSummaryCell
          variantType="label"
          label={t("common.total", "Tổng") + ":"}
        />
      ),
      name: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${lines.length} ${t("cases.quotePreview.linesUnit", "dòng")}`}
        />
      ),
      quantity: (
        <SubtotalSummaryCell
          variantType="qty"
          subtotalQty={totalQty}
          metricTitle={t("cases.quotePreview.qty", "SL")}
        />
      ),
      amount: (
        <SubtotalSummaryCell
          variantType="amount"
          subtotalAmount={totalAmount}
          metricTitle={t("cases.quotePreview.amount", "Thành tiền")}
        />
      ),
      totalCost: (
        <SubtotalSummaryCell
          variantType="amount"
          subtotalAmount={totalCost}
          metricTitle={t("cases.quotePreview.totalCost", "Tổng vốn")}
        />
      ),
    };
  }, [lines.length, totalQty, totalAmount, totalCost, t]);

  return (
    <div className={className || "w-full"}>
      <StandardTable
        tableId="garage-quote-services-table"
        items={lines}
        columns={columns}
        getRowKey={(row) => row.id}
        variant="spreadsheet"
        loading={loading}
        minWidth={1180}
        summaryRow={summaryRow}
        emptyLabel={t(
          "cases.quotePreview.noServices",
          "Chưa có danh mục dịch vụ - nhân công",
        )}
        containerClassName="min-h-0"
      />
    </div>
  );
}
