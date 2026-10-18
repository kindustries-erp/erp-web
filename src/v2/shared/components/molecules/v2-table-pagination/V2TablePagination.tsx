import * as React from "react";
import { V2PageButton } from "@/v2/shared/components/atoms/v2-page-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2_PAGE_SIZE_OPTIONS } from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";
import { getPageWindow } from "./V2TablePagination.helper";
import { V2PageSizeSelect } from "./V2TablePagination.size-select";
import type { V2TablePaginationProps } from "./V2TablePagination.type";

const Gap = () => <span className="px-1 text-xs text-faint">…</span>;

export const V2TablePagination = React.memo(function V2TablePagination({
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
        <span>{t("v2.table.showRows", "Hiển thị")}</span>
        <V2PageSizeSelect
          value={pageSize}
          options={pageSizeOptions}
          onChange={onPageSizeChange}
        />
        <span>{t("v2.table.rowsSuffix", "hàng/trang")}</span>
      </div>
      <span className="text-xs tabular-nums text-muted-fg max-[480px]:hidden">
        {t("v2.table.pageInfo", { from, to, total })}
      </span>
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
});
