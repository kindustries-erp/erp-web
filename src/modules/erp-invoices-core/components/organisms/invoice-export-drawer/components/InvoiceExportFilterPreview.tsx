import React from "react";
import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import { toDisplayRange } from "../InvoiceExportDrawer.helper";
import type { InvoiceExportDrawerProps } from "../InvoiceExportDrawer.type";

export interface InvoiceExportFilterPreviewProps {
  currentFilterSummary?: InvoiceExportDrawerProps["currentFilterSummary"];
}

export function InvoiceExportFilterPreview({
  currentFilterSummary,
}: InvoiceExportFilterPreviewProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-2 text-xs">
      <div className="font-medium text-foreground flex items-center gap-1.5">
        <Filter className="w-3.5 h-3.5 text-foreground" />
        <span>
          {t(
            "erpInvoices:exportDrawer.activeFilterSummary",
            "Tóm tắt bộ lọc bảng",
          )}
        </span>
      </div>
      <div className="space-y-1.5 text-muted-foreground text-[11px]">
        <div className="flex justify-between items-center py-0.5 border-b border-border/40">
          <span>
            {t("erpInvoices:exportDrawer.tableDateRange", "Khoảng ngày bảng:")}
          </span>
          <span className="font-medium text-foreground">
            {currentFilterSummary?.dateFrom || currentFilterSummary?.dateTo
              ? toDisplayRange(
                  currentFilterSummary.dateFrom,
                  currentFilterSummary.dateTo,
                )
              : t("erpInvoices:exportDrawer.allRange", "Tất cả")}
          </span>
        </div>
        {currentFilterSummary?.search && (
          <div className="flex justify-between items-center py-0.5 border-b border-border/40">
            <span>
              {t("erpInvoices:exportDrawer.searchKeyword", "Từ khóa:")}
            </span>
            <span
              className="font-medium text-foreground truncate max-w-[140px]"
              title={currentFilterSummary.search}
            >
              {currentFilterSummary.search}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center py-0.5">
          <span>
            {t("erpInvoices:exportDrawer.filterConditions", "Điều kiện lọc:")}
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            {currentFilterSummary?.filterCount
              ? t(
                  "erpInvoices:exportDrawer.activeFiltersCount",
                  "{{count}} điều kiện lọc",
                  { count: currentFilterSummary.filterCount },
                )
              : t(
                  "erpInvoices:exportDrawer.noActiveFilters",
                  "Không có bộ lọc nào",
                )}
          </Badge>
        </div>
      </div>
    </div>
  );
}
