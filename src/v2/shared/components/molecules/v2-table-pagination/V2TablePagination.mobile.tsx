import * as React from "react";
import { V2Button, V2Icon, V2Text } from "@/v2/shared/components/atoms";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "@/v2/shared/components/atoms/v2-icon/icons";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2_PAGE_SIZE_OPTIONS } from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";
import { V2TablePaginationSheet } from "./V2TablePagination.sheet";
import type { V2TablePaginationProps } from "./V2TablePagination.type";

export const V2TablePaginationMobile = React.memo(
  function V2TablePaginationMobile({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = V2_PAGE_SIZE_OPTIONS,
    className,
  }: V2TablePaginationProps) {
    const { t } = useV2Translation();
    const [sheetOpen, setSheetOpen] = React.useState(false);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(Math.max(1, page), totalPages);
    const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
    const to = Math.min(current * pageSize, total);

    return (
      <>
        <nav
          data-testid="v2-table-pagination-mobile"
          aria-label={t("v2.table.paginationSheetTitle", "Phân trang dữ liệu")}
          className={cn("flex items-center justify-between gap-2", className)}
        >
          <V2Button
            type="button"
            variant="outline"
            disabled={current <= 1}
            aria-label={t("v2.table.prevPage", "Trang trước")}
            onClick={() => onPageChange(current - 1)}
            className="h-11 w-11 shrink-0 rounded-xl p-0"
          >
            <V2Icon icon={ChevronLeft} size={16} />
          </V2Button>

          <V2Button
            type="button"
            variant="outline"
            data-testid="v2-table-pagination-trigger"
            onClick={() => setSheetOpen(true)}
            aria-label={t(
              "v2.table.paginationSheetTitle",
              "Phân trang dữ liệu",
            )}
            className="h-11 min-w-0 flex-1 gap-1.5 rounded-xl border-border/70 bg-card px-3 shadow-xs hover:bg-surface/80 active:scale-[0.98]"
          >
            <V2Text
              as="span"
              variant="caption"
              weight="semibold"
              className="whitespace-nowrap tabular-nums text-foreground"
            >
              {t("v2.table.pageOf", { page: current, totalPages })}
            </V2Text>
            <V2Text
              as="span"
              variant="caption"
              color="muted"
              className="opacity-60"
            >
              •
            </V2Text>
            <V2Text
              as="span"
              variant="caption"
              color="muted"
              truncate
              className="tabular-nums"
            >
              {t("v2.table.pageInfo", { from, to, total })}
            </V2Text>
            <V2Icon
              icon={ChevronsUpDown}
              size={14}
              className="ml-0.5 text-muted-fg"
            />
          </V2Button>

          <V2Button
            type="button"
            variant="outline"
            disabled={current >= totalPages}
            aria-label={t("v2.table.nextPage", "Trang sau")}
            onClick={() => onPageChange(current + 1)}
            className="h-11 w-11 shrink-0 rounded-xl p-0"
          >
            <V2Icon icon={ChevronRight} size={16} />
          </V2Button>
        </nav>

        <V2TablePaginationSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          current={current}
          totalPages={totalPages}
          pageSize={pageSize}
          total={total}
          from={from}
          to={to}
          pageSizeOptions={pageSizeOptions}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </>
    );
  },
);
