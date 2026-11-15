import * as React from "react";
import { V2PageButton, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2_PAGE_SIZE_OPTIONS } from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";
import { getPageWindow } from "./V2TablePagination.helper";
import { V2PageSizeSelect } from "./V2TablePagination.size-select";
import type { V2TablePaginationProps } from "./V2TablePagination.type";

const Gap = () => (
  <V2Text as="span" variant="caption" className="px-1 text-faint">
    …
  </V2Text>
);

export const V2TablePaginationDesktop = React.memo(
  function V2TablePaginationDesktop({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = V2_PAGE_SIZE_OPTIONS,
    className,
  }: V2TablePaginationProps) {
    const { t } = useV2Translation();
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(Math.max(1, page), totalPages);
    const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
    const to = Math.min(current * pageSize, total);
    const window = getPageWindow(current, totalPages);
    const pages = Array.from(
      { length: window.end - window.start + 1 },
      (_, index) => window.start + index,
    );

    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2",
          className,
        )}
      >
        <div className="flex items-center gap-2 text-xs text-muted-fg">
          <V2Text as="span" variant="caption" color="muted">
            {t("v2.table.showRows", "Hiển thị")}
          </V2Text>
          <V2PageSizeSelect
            value={pageSize}
            options={pageSizeOptions}
            onChange={onPageSizeChange}
          />
          <V2Text as="span" variant="caption" color="muted">
            {t("v2.table.rowsSuffix", "hàng/trang")}
          </V2Text>
        </div>
        <V2Text
          as="span"
          variant="caption"
          color="muted"
          className="tabular-nums max-[480px]:hidden"
        >
          {t("v2.table.pageInfo", { from, to, total })}
        </V2Text>
        <nav className="flex items-center gap-1">
          <V2PageButton
            disabled={current <= 1}
            aria-label={t("v2.table.prevPage", "Trang trước")}
            onClick={() => onPageChange(current - 1)}
          >
            ‹
          </V2PageButton>
          {window.showFirst && (
            <>
              <V2PageButton
                active={current === 1}
                onClick={() => onPageChange(1)}
              >
                1
              </V2PageButton>
              {window.showFirstGap && <Gap />}
            </>
          )}
          {pages.map((p) => (
            <V2PageButton
              key={p}
              active={p === current}
              onClick={() => onPageChange(p)}
            >
              {p}
            </V2PageButton>
          ))}
          {window.showLast && (
            <>
              {window.showLastGap && <Gap />}
              <V2PageButton
                active={current === totalPages}
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </V2PageButton>
            </>
          )}
          <V2PageButton
            disabled={current >= totalPages}
            aria-label={t("v2.table.nextPage", "Trang sau")}
            onClick={() => onPageChange(current + 1)}
          >
            ›
          </V2PageButton>
        </nav>
      </div>
    );
  },
);
