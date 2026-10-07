import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardTable } from "@/shared/components/StandardTable";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { getQuoteCostTableColumns } from "./QuoteCostTable.columns";
import type {
  QuoteCostTableProps,
  QuoteCostTableRow,
} from "./QuoteCostSummarySection.type";

export const QuoteCostTable: React.FC<QuoteCostTableProps> = ({
  totalCostAmount,
  totalPaid,
  remainingAmount,
  activeLinkedInvoices,
  activeSettlements,
  canPerformPayment,
  disabledReason,
  onPaymentClick,
  className,
}) => {
  const { t } = useTranslation(["garage", "common"]);

  const costLinkedInvoices = useMemo(() => {
    return (activeLinkedInvoices || [])
      .filter((inv: any) => {
        const linkType = inv.linkType || inv.direction;
        return linkType === "IN";
      })
      .map((inv: any) => ({
        id: inv.id || inv.invoiceId,
        invoiceId: inv.invoiceId || inv.id,
        invoiceNo: inv.invoiceNo || inv.invoice?.invoiceNo || "---",
        totalAmount: Number(inv.totalAmount || inv.invoice?.totalAmount || 0),
        invoiceDate: inv.invoiceDate || inv.invoice?.invoiceDate,
        sellerName:
          inv.sellerName || inv.invoice?.sellerName || inv.partnerName,
        hasBankNetOff: Boolean(
          inv.hasBankNetOff ||
          Number(inv.bankSettledAmount || 0) > 0 ||
          (activeSettlements || []).some(
            (s: any) =>
              (s.sourceChannel === "ON_SYSTEM" ||
                s.source_channel === "ON_SYSTEM") &&
              (s.invoiceId === inv.invoiceId ||
                s.referenceNumber === inv.invoiceNo),
          ),
        ),
        bankSettledAmount: Number(inv.bankSettledAmount || 0),
      }));
  }, [activeLinkedInvoices, activeSettlements]);

  const items: QuoteCostTableRow[] = useMemo(() => {
    return [
      {
        id: "cost_total",
        stt: 1,
        payer: "VENDOR",
        labelKey: "cases.financials.totalCostTitle",
        defaultLabel: "Tổng chi phí vụ việc (Giá vốn & Nhân công)",
        amount: totalCostAmount,
        paidAmount: totalPaid,
        remainingAmount: remainingAmount,
        linkedInvoices: costLinkedInvoices,
      },
    ];
  }, [totalCostAmount, totalPaid, remainingAmount, costLinkedInvoices]);

  const columns = useMemo(
    () =>
      getQuoteCostTableColumns(
        t,
        onPaymentClick,
        canPerformPayment,
        disabledReason,
      ),
    [t, onPaymentClick, canPerformPayment, disabledReason],
  );

  const summaryRow = useMemo(() => {
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
          label={`1 ${t("cases.financials.costCategoryUnit", "khoản mục")}`}
        />
      ),
      label: (
        <SubtotalSummaryCell
          variantType="label"
          label={t("cases.financials.totalCostLabel", "Tổng chi phí")}
        />
      ),
      amount: (
        <SubtotalSummaryCell
          variantType="amount"
          subtotalAmount={totalCostAmount}
          metricTitle={t("cases.financials.totalCostLabel", "Tổng chi phí")}
        />
      ),
      paidAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          subtotalAmount={totalPaid}
          metricTitle={t("cases.financials.paidCostCol", "Đã chi")}
        />
      ),
      remainingAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          subtotalAmount={remainingAmount}
          metricTitle={t("cases.financials.remainingCostCol", "Còn lại")}
        />
      ),
      linkedInvoices: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${costLinkedInvoices.length} HĐ`}
        />
      ),
    };
  }, [
    totalCostAmount,
    totalPaid,
    remainingAmount,
    costLinkedInvoices.length,
    t,
  ]);

  return (
    <div className={className || "w-full"}>
      <StandardTable
        tableId="garage-quote-cost-table"
        items={items}
        columns={columns}
        getRowKey={(row) => row.id}
        variant="spreadsheet"
        minWidth={780}
        summaryRow={summaryRow}
        containerClassName="min-h-0"
      />
    </div>
  );
};
