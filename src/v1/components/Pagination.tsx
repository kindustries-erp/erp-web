import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { TxSource } from "@/shared/types";
import { useTransactionStore } from "@/core/config/transactionStore";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";

interface PaginationProps {
  src: TxSource;
  total: number;
  pageSizeOptions?: number[];
}

export function Pagination({
  src,
  total,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
  const { pagination, goPage, setPageSize } = useTransactionStore();
  const t = useT();
  const { page, size } = pagination[src];
  const totalPages = Math.ceil(total / size);

  // Build page buttons
  const maxShow = 5;
  let start = Math.max(1, page - Math.floor(maxShow / 2));
  const end = Math.min(totalPages, start + maxShow - 1);
  if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1);

  const from = (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  const btnClass = (active = false, disabled = false) =>
    cn(
      "w-7 h-7 border rounded-[6px] text-xs flex items-center justify-center font-medium cursor-pointer select-none",
      active
        ? "bg-primary text-primary-fg border-primary"
        : "bg-surface border-border text-foreground hover:bg-surface-hover",
      disabled &&
        "text-[color:var(--faint)] cursor-default pointer-events-none opacity-40",
    );

  return (
    <div className="flex items-center justify-between pt-3 pb-[2px] border-t border-[color:var(--border-light)] mt-1 gap-2 flex-wrap">
      {/* Page size */}
      <div className="flex items-center gap-2 text-xs text-[color:var(--muted-fg)]">
        {t("common.show")}{" "}
        <PageSizeSelect
          value={size}
          options={pageSizeOptions}
          onChange={(v) => setPageSize(src, v)}
        />{" "}
        {t("common.perPage")}
      </div>

      {/* Info */}
      <span className="text-xs text-[color:var(--muted-fg)] max-[480px]:hidden">
        {from}–{to} / {total}
      </span>

      {/* Buttons */}
      <div className="flex items-center gap-1">
        <button
          className={btnClass(false, page === 1)}
          onClick={() => goPage(src, page - 1)}
          disabled={page === 1}
        >
          ‹
        </button>
        {start > 1 && (
          <>
            <button className={btnClass()} onClick={() => goPage(src, 1)}>
              1
            </button>
            {start > 2 && (
              <span className="px-1 text-xs text-[color:var(--faint)]">…</span>
            )}
          </>
        )}
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
          (p) => (
            <button
              key={p}
              className={btnClass(p === page)}
              onClick={() => goPage(src, p)}
            >
              {p}
            </button>
          ),
        )}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className="px-1 text-xs text-[color:var(--faint)]">…</span>
            )}
            <button
              className={btnClass()}
              onClick={() => goPage(src, totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          className={btnClass(false, page === totalPages)}
          onClick={() => goPage(src, page + 1)}
          disabled={page === totalPages}
        >
          ›
        </button>
      </div>
    </div>
  );
}

function PageSizeSelect({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-2 py-[3px] border border-border rounded-[6px] text-xs text-foreground bg-surface hover:bg-surface-hover cursor-pointer outline-none"
        >
          {value}
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[color:var(--muted-fg)]"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          align="start"
          className="z-[9999] rounded-lg popup-content overflow-hidden"
        >
          {options.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                onChange(v);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-[6px] text-xs flex items-center justify-between gap-3",
                v === value
                  ? "text-[color:var(--primary)] font-semibold bg-[color:var(--primary)]/5"
                  : "text-foreground hover:bg-[color:var(--popup-bg-hover)]",
              )}
            >
              {v}
              {v === value && (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-[color:var(--primary)]"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
