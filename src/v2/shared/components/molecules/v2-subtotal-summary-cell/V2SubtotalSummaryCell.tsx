import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Popover } from "@/v2/shared/components/molecules/v2-popover";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { useV2SubtotalPopover } from "./V2SubtotalSummaryCell.hook";
import type { V2SubtotalSummaryCellProps } from "./V2SubtotalSummaryCell.type";
import {
  formatSubtotalValue,
  isMultiPage,
  ratioPct,
  resolveCumulative,
} from "./V2SubtotalSummaryCell.utils";

export const V2SubtotalSummaryCell: React.FC<V2SubtotalSummaryCellProps> = ({
  variant,
  pageValue,
  totalValue,
  page = 1,
  totalPages = 1,
  cumulativeValue,
  displayMode = "page",
  metricTitle,
  unit,
  locale,
  className,
}) => {
  const { t } = useV2Translation();
  const popover = useV2SubtotalPopover();

  const shownValue = displayMode === "total" ? totalValue : pageValue;
  const multiPage = isMultiPage(totalPages);
  const cumulative = resolveCumulative(page, pageValue, cumulativeValue);
  const pageRatio = ratioPct(pageValue, totalValue);
  const cumulativeRatio =
    cumulative === undefined ? pageRatio : ratioPct(cumulative, totalValue);
  const fmt = (value: number) =>
    formatSubtotalValue(variant, value, unit, locale);

  const title =
    metricTitle ??
    (variant === "amount"
      ? t("v2.subtotal.amount", "Thành tiền")
      : variant === "count"
        ? t("v2.subtotal.lines", "Số dòng")
        : t("v2.subtotal.quantity", "Số lượng"));

  const row = (label: string, value: string, emphasized = false) => (
    <div className="flex items-center justify-between gap-4">
      <span className="min-w-0 truncate text-muted-fg">{label}</span>
      <span
        className={cn(
          "shrink-0 whitespace-nowrap font-mono tabular-nums",
          emphasized ? "font-semibold text-foreground" : "text-foreground/80",
        )}
      >
        {value}
      </span>
    </div>
  );

  const content = (
    <div
      ref={popover.contentRef}
      className="flex w-full flex-col gap-2.5"
      {...popover.contentHandlers}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
        <span className="truncate font-semibold text-foreground">{title}</span>
        {multiPage && (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-fg">
            {t("v2.subtotal.page", "Trang")} {page}/{totalPages}
          </span>
        )}
      </div>

      {row(t("v2.subtotal.currentPage", "Trang hiện tại"), fmt(pageValue))}
      {multiPage &&
        cumulative !== undefined &&
        row(
          t("v2.subtotal.cumulative", {
            defaultValue: `Lũy kế (T1 → T${page})`,
          }),
          fmt(cumulative),
        )}
      {row(
        multiPage
          ? t("v2.subtotal.grandTotalAllPages", {
              defaultValue: `Tổng toàn bộ (${totalPages} trang)`,
            })
          : t("v2.subtotal.grandTotal", "Tổng toàn bộ"),
        fmt(totalValue),
        true,
      )}

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(cumulativeRatio)}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${cumulativeRatio}%` }}
        />
      </div>
    </div>
  );

  return (
    <div
      className={cn("inline-flex min-w-0 items-center", className)}
      onKeyDown={popover.onEscape}
    >
      <V2Popover
        open={popover.open}
        onOpenChange={popover.onOpenChange}
        side="bottom"
        align="end"
        hideCloseButton
        className="w-[320px] max-w-[calc(100vw-32px)]"
        content={content}
        trigger={
          <V2Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label={t("v2.subtotal.openDetail", "Xem chi tiết số liệu")}
            className="h-auto min-w-0 px-1 py-0.5 font-mono tabular-nums"
            {...popover.triggerHandlers}
          >
            {fmt(shownValue)}
          </V2Button>
        }
      />
    </div>
  );
};
V2SubtotalSummaryCell.displayName = "V2SubtotalSummaryCell";
