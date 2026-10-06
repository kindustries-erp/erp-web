import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardTable } from "@/shared/components/StandardTable";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { getQuoteReceivablesTableColumns } from "./QuoteReceivablesTable.columns";
import type {
  QuoteReceivablesTableProps,
  QuoteReceivableRow,
} from "./QuoteReceivablesTable.type";

export function QuoteReceivablesTable({
  items: propItems,
  caseData,
  loading = false,
  className,
  canEditFinancial = true,
  onPaymentClick,
}: QuoteReceivablesTableProps) {
  const { t } = useTranslation(["garage", "common"]);

  const items: QuoteReceivableRow[] = useMemo(() => {
    if (propItems && propItems.length > 0) {
      return propItems;
    }
    const rawData = caseData?.rawData;
    const khAmount = Number(
      rawData?.TienThanhToanKH ?? caseData?.tienThanhToanKh ?? 0,
    );
    const bhAmount = Number(
      rawData?.TienThanhToanBH ?? caseData?.tienThanhToanBh ?? 0,
    );

    return [
      {
        id: "KH",
        stt: 1,
        payer: "KH",
        labelKey: "cases.quotePreview.fin.customerPayment",
        defaultLabel: "Khách hàng thanh toán",
        amount: khAmount,
      },
      {
        id: "BH",
        stt: 2,
        payer: "BH",
        labelKey: "cases.quotePreview.fin.insuranceApproved",
        defaultLabel: "Bảo hiểm thanh toán",
        amount: bhAmount,
      },
    ];
  }, [propItems, caseData]);

  const columns = useMemo(
    () => getQuoteReceivablesTableColumns(t, onPaymentClick, canEditFinancial),
    [t, onPaymentClick, canEditFinancial],
  );

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
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
    };
  }, [items.length, totalAmount, t]);

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
