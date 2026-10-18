import React from "react";
import { Filter, Calendar, Search, CreditCard, MapPin } from "lucide-react";
import { useT } from "@/core/i18n";
import { Badge } from "@/shared/components/ui/badge";
import { toDisplayRange } from "../BankStatementExportDrawer.helper";
import { FilterConditionBadge } from "./FilterConditionBadge";
import type { BankStatementFilterSummary } from "../BankStatementExportDrawer.type";

export interface BankStatementExportFilterPreviewProps {
  summary?: BankStatementFilterSummary;
  type: "bank" | "cash";
}

export function BankStatementExportFilterPreview({
  summary,
  type,
}: BankStatementExportFilterPreviewProps) {
  const t = useT();

  const hasDateRange = Boolean(summary?.dateFrom || summary?.dateTo);
  const dateRangeText = hasDateRange
    ? toDisplayRange(summary?.dateFrom, summary?.dateTo)
    : t("bankStatement.allTime", "Tất cả thời gian");

  const hasColumnFilters = Boolean(
    summary?.columnFiltersSummary && summary.columnFiltersSummary.length > 0,
  );

  const hasActiveFilters = Boolean(
    summary?.hasActiveFilters ||
    (summary?.filterCount && summary.filterCount > 0) ||
    summary?.search ||
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
          {t("bankStatement.exportFilterPreviewTitle", "Bộ lọc đang áp dụng")}
        </span>
        {summary?.filterCount ? (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {summary.filterCount}{" "}
            {t("bankStatement.exportConditions", "điều kiện")}
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
              {t("bankStatement.branch", "Chi nhánh")}:{" "}
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
              {type === "bank"
                ? t("bankStatement.bankAccount", "Tài khoản")
                : t("bankStatement.cashBook", "Sổ quỹ")}
              :{" "}
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
              {t("bankStatement.transactionType", "Loại GD")}:{" "}
              <strong className="text-foreground font-medium">
                {summary.transactionType === "IN"
                  ? t("bankStatement.typeIn", "Tiền vào (Thu)")
                  : summary.transactionType === "OUT"
                    ? t("bankStatement.typeOut", "Tiền ra (Chi)")
                    : summary.transactionType}
              </strong>
            </span>
          </div>
        )}

        {summary?.search && (
          <div className="flex items-center gap-1.5">
            <Search className="w-3 h-3 text-muted-foreground shrink-0" />
            <span>
              {t("bankStatement.searchLabel", "Từ khóa")}:{" "}
              <strong className="text-foreground font-medium">
                {summary.search}
              </strong>
            </span>
          </div>
        )}

        {hasColumnFilters && (
          <div className="pt-1.5 space-y-1 border-t border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
              {t("bankStatement.tableColumnFilters", "Lọc theo cột bảng")}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {summary!.columnFiltersSummary!.map((item, index) => (
                <FilterConditionBadge
                  key={item.id || `${item.columnKey}-${item.type || index}`}
                  label={item.columnLabel}
                  value={item.displayValue}
                />
              ))}
            </div>
          </div>
        )}

        {!hasActiveFilters && (
          <p className="italic text-muted-foreground/80">
            {t(
              "bankStatement.exportAllRecords",
              "Không có bộ lọc thu hẹp. Sẽ xuất toàn bộ bản ghi theo quyền truy cập.",
            )}
          </p>
        )}
      </div>
    </div>
  );
}
