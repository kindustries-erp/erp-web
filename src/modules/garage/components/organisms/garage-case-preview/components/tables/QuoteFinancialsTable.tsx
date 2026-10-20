import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardTable } from "@/shared/components/StandardTable";
import { getQuoteFinancialsTableColumns } from "./QuoteFinancialsTable.columns";
import type { QuoteFinancialItem } from "../../GarageCasePreview.type";

export interface QuoteFinancialsTableProps {
  items: QuoteFinancialItem[];
  loading?: boolean;
  className?: string;
}

export function QuoteFinancialsTable({
  items,
  loading = false,
  className,
}: QuoteFinancialsTableProps) {
  const { t } = useTranslation(["garage", "common"]);

  const columns = useMemo(() => getQuoteFinancialsTableColumns(t), [t]);

  return (
    <div className={className || "w-full"}>
      <StandardTable
        tableId="garage-quote-financials-table"
        items={items}
        columns={columns}
        getRowKey={(row) => row.id}
        variant="spreadsheet"
        loading={loading}
        minWidth={850}
        emptyLabel={t(
          "cases.quotePreview.noFinancialItems",
          "Chưa có chỉ số tài chính ghi nhận",
        )}
        containerClassName="min-h-0"
      />
    </div>
  );
}
