import * as React from "react";
import {
  V2Button,
  V2Icon,
  V2Input,
  V2PageButton,
  V2Text,
} from "@/v2/shared/components/atoms";
import {
  ChevronsLeft,
  ChevronsRight,
} from "@/v2/shared/components/atoms/v2-icon/icons";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Size } from "@/v2/shared/types";
import { cn } from "@/v2/shared/utils/cn";
import type { V2PageChunk } from "./V2TablePagination.helper";

export interface PagePickerSectionProps {
  open?: boolean;
  current: number;
  totalPages: number;
  pageList: number[];
  chunks?: readonly V2PageChunk[];
  activeChunkIndex?: number;
  onChunkChange?: (index: number) => void;
  jumpInput: string;
  onJumpInputChange: (val: string) => void;
  onSelectPage: (page: number) => void;
  onJumpSubmit: (e: React.FormEvent) => void;
}

export const PagePickerSection: React.FC<PagePickerSectionProps> = ({
  open,
  current,
  totalPages,
  pageList,
  chunks,
  activeChunkIndex = 0,
  onChunkChange,
  jumpInput,
  onJumpInputChange,
  onSelectPage,
  onJumpSubmit,
}) => {
  const { t } = useV2Translation();
  const activeChunkRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (open && chunks && chunks.length > 0) {
      activeChunkRef.current?.scrollIntoView?.({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [open, activeChunkIndex, chunks]);

  return (
    <section className="flex flex-col gap-2.5">
      <V2Text as="h3" variant="label" color="muted" weight="semibold">
        {t("v2.table.selectPage", "Chọn trang")}
      </V2Text>
      {totalPages > 20 && (
        <form onSubmit={onJumpSubmit} className="flex items-center gap-2">
          <V2Input
            type="number"
            inputMode="numeric"
            size={V2Size.LG}
            min={1}
            max={totalPages}
            value={jumpInput}
            onChange={(e) => onJumpInputChange(e.target.value)}
            aria-label={t("v2.table.jumpToPage", "Đi đến trang")}
            placeholder={t(
              "v2.table.jumpToPagePlaceholder",
              "Nhập số trang...",
            )}
            containerClassName="min-w-0 flex-1"
            inputClassName="h-11 rounded-xl tabular-nums"
          />
          <V2Button
            type="submit"
            variant="outline"
            className="h-11 shrink-0 rounded-xl px-4 text-sm"
          >
            {t("v2.table.goToPage", "Đi đến")}
          </V2Button>
        </form>
      )}
      <div className="flex items-center gap-2">
        <V2Button
          type="button"
          variant="outline"
          disabled={current <= 1}
          onClick={() => onSelectPage(1)}
          leftIcon={<V2Icon icon={ChevronsLeft} size={16} />}
          className="h-11 flex-1 rounded-xl text-xs"
        >
          {t("v2.table.firstPage", "Trang đầu")}
        </V2Button>
        <V2Button
          type="button"
          variant="outline"
          disabled={current >= totalPages}
          onClick={() => onSelectPage(totalPages)}
          rightIcon={<V2Icon icon={ChevronsRight} size={16} />}
          className="h-11 flex-1 rounded-xl text-xs"
        >
          {t("v2.table.lastPage", { page: totalPages })}
        </V2Button>
      </div>
      {chunks && chunks.length > 1 && (
        <div
          data-testid="v2-table-pagination-range-chips"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
        >
          {chunks.map((chunk, index) => {
            const active = index === activeChunkIndex;
            return (
              <V2Button
                key={chunk.label}
                ref={active ? activeChunkRef : undefined}
                type="button"
                variant="outline"
                aria-pressed={active}
                onClick={() => onChunkChange?.(index)}
                className={cn(
                  "h-9 shrink-0 rounded-lg px-3 text-xs tabular-nums shadow-none",
                  active
                    ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary hover:bg-primary/15 hover:text-primary"
                    : "border-border/70 bg-card hover:bg-surface/80 text-muted-fg",
                )}
              >
                {chunk.label}
              </V2Button>
            );
          })}
        </div>
      )}
      <div
        data-testid="v2-table-pagination-page-grid"
        className="grid max-h-[34dvh] grid-cols-5 gap-2 overflow-y-auto p-0.5"
      >
        {pageList.map((p) => (
          <V2PageButton
            key={p}
            active={p === current}
            onClick={() => onSelectPage(p)}
            className="h-11 w-full rounded-xl text-sm font-medium tabular-nums"
          >
            {p}
          </V2PageButton>
        ))}
      </div>
    </section>
  );
};
