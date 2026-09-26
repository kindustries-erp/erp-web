import React from "react";
import { StandardTable } from "@/shared/components/StandardTable";
import { useTranslation } from "react-i18next";
import { useInvoiceDetailLinesColumns } from "./hooks/useInvoiceDetailLinesColumns";
import type { ErpInvoiceDetailLinesTableProps } from "./types";
import { Boxes } from "lucide-react";

export const ErpInvoiceDetailLinesTable = React.memo(
  function ErpInvoiceDetailLinesTable({
    invoice,
    items,
    className,
    loading = false,
  }: ErpInvoiceDetailLinesTableProps) {
    const { t } = useTranslation("erpInvoices");
    const { columns, displayItems, summaryRow } = useInvoiceDetailLinesColumns({
      invoice,
      items,
    });

    if (!loading && displayItems.length === 0) {
      return (
        <div className="w-full min-h-[220px] flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-border/80 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center mb-2.5 text-muted-foreground">
            <Boxes className="w-5 h-5 text-muted-foreground/70" />
          </div>
          <div className="text-xs font-semibold text-foreground mb-0.5">
            {t("noItemLines", "Không có dòng hàng hóa, dịch vụ")}
          </div>
          <div className="text-[11px] text-muted-foreground max-w-xs">
            {t(
              "noItemLinesDesc",
              "Hóa đơn chưa có danh sách chi tiết từng dòng hàng hóa hoặc dịch vụ.",
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className={
          className ||
          "w-full min-h-[220px] flex flex-col overflow-hidden bg-surface"
        }
      >
        <StandardTable
          items={displayItems}
          columns={columns}
          getRowKey={(r) => String(r.id)}
          loading={loading}
          variant="spreadsheet"
          minWidth={850}
          tableId="erp-invoice-detail-lines-table"
          enableColumnResizing={true}
          enableRowHoverActions={false}
          summaryRow={summaryRow}
          containerClassName="flex-1 min-h-0 w-full"
        />
      </div>
    );
  },
);
