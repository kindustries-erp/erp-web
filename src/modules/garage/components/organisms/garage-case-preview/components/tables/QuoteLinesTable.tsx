import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardTable } from "@/shared/components/StandardTable";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { getQuoteLinesTableColumns } from "./QuoteLinesTable.columns";
import type { QuoteLineItem } from "../../GarageCasePreview.type";

export interface QuoteLinesTableProps {
  lines: QuoteLineItem[];
  loading?: boolean;
  className?: string;
}

export function QuoteLinesTable({
  lines,
  loading = false,
  className,
}: QuoteLinesTableProps) {
  const { t } = useTranslation(["garage", "common"]);

  const columns = useMemo(() => getQuoteLinesTableColumns(t), [t]);

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
        tableId="garage-quote-lines-table"
        items={lines}
        columns={columns}
        getRowKey={(row) => row.id}
        variant="spreadsheet"
        loading={loading}
        minWidth={1180}
        summaryRow={summaryRow}
        emptyLabel={t(
          "cases.quotePreview.noLines",
          "Chưa có danh mục vật tư hoặc nhân công",
        )}
        containerClassName="min-h-0"
      />
    </div>
  );
}
