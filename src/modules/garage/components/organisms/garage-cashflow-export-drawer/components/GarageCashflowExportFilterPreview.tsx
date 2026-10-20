import React from "react";
import { Filter, Calendar, Search, CreditCard, MapPin } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { toDisplayRange } from "../GarageCashflowExportDrawer.helper";

export interface GarageCashflowExportFilterSummary {
  dateFrom?: string;
  dateTo?: string;
  branchName?: string;
  accountName?: string;
  transactionType?: string;
  search?: string;
  q?: string;
  filterCount?: number;
  columnFilters?: Record<string, string[]>;
  columnFiltersSummary?: Array<{
    columnKey: string;
    columnLabel: string;
    displayValue: string;
  }>;
}

export interface GarageCashflowExportFilterPreviewProps {
  summary?: GarageCashflowExportFilterSummary;
}

export function GarageCashflowExportFilterPreview({
  summary,
}: GarageCashflowExportFilterPreviewProps) {
  const hasDateRange = Boolean(summary?.dateFrom || summary?.dateTo);
  const dateRangeText = hasDateRange
    ? toDisplayRange(summary?.dateFrom, summary?.dateTo)
    : "Tất cả thời gian";

  const hasColumnFilters = Boolean(
    (summary?.columnFiltersSummary &&
      summary.columnFiltersSummary.length > 0) ||
    (summary?.columnFilters && Object.keys(summary.columnFilters).length > 0),
  );

  const searchKeyword = summary?.search || summary?.q;

  const hasActiveFilters = Boolean(
    (summary?.filterCount && summary.filterCount > 0) ||
    searchKeyword ||
    summary?.accountName ||
    summary?.transactionType ||
    summary?.branchName ||
    hasColumnFilters,
  );

  return (
    <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-2.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          Bộ lọc đang áp dụng
        </span>
        {summary?.filterCount ? (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {summary.filterCount} điều kiện
          </Badge>
        ) : null}
      </div>

      <div className="space-y-1.5 text-muted-foreground text-[11px]">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-foreground font-medium">{dateRangeText}</span>
        </div>

        {summary?.branchName && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
            <span>
              Chi nhánh:{" "}
              <strong className="text-foreground font-medium">
                {summary.branchName}
              </strong>
            </span>
          </div>
        )}

        {summary?.accountName && (
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3 h-3 text-muted-foreground shrink-0" />
            <span>
              Tài khoản:{" "}
              <strong className="text-foreground font-medium">
                {summary.accountName}
              </strong>
            </span>
          </div>
        )}

        {summary?.transactionType && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 flex items-center justify-center font-bold text-[10px] shrink-0">
              ⇄
            </span>
            <span>
              Loại GD:{" "}
              <strong className="text-foreground font-medium">
                {summary.transactionType === "RECEIPT"
                  ? "Tiền vào (Thu)"
                  : summary.transactionType === "PAYMENT"
                    ? "Tiền ra (Chi)"
                    : summary.transactionType}
              </strong>
            </span>
          </div>
        )}

        {searchKeyword && (
          <div className="flex items-center gap-1.5">
            <Search className="w-3 h-3 text-muted-foreground shrink-0" />
            <span>
              Từ khóa:{" "}
              <strong className="text-foreground font-medium">
                {searchKeyword}
              </strong>
            </span>
          </div>
        )}

        {summary?.columnFiltersSummary &&
          summary.columnFiltersSummary.length > 0 && (
            <div className="pt-1.5 space-y-1 border-t border-border/40">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                Lọc theo cột bảng:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {summary.columnFiltersSummary.map((item, index) => (
                  <Badge
                    key={`${item.columnKey}-${index}`}
                    variant="outline"
                    className="text-[10px] font-normal border-border/60 bg-background/50"
                  >
                    <span className="text-muted-foreground mr-1">
                      {item.columnLabel}:
                    </span>
                    <span className="text-foreground font-medium">
                      {item.displayValue}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {!summary?.columnFiltersSummary &&
          summary?.columnFilters &&
          Object.keys(summary.columnFilters).length > 0 && (
            <div className="pt-1.5 space-y-1 border-t border-border/40">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                Lọc theo cột bảng:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(summary.columnFilters).map(([key, vals]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="text-[10px] font-normal border-border/60 bg-background/50"
                  >
                    <span className="text-muted-foreground mr-1">{key}:</span>
                    <span className="text-foreground font-medium">
                      {vals.join(", ")}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {!hasActiveFilters && (
          <p className="italic text-muted-foreground/80">
            Không có bộ lọc thu hẹp. Sẽ xuất toàn bộ bản ghi theo quyền truy
            cập.
          </p>
        )}
      </div>
    </div>
  );
}
