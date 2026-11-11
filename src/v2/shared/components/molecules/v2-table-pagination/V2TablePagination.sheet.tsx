import * as React from "react";
import { V2Button, V2Icon, V2Text } from "@/v2/shared/components/atoms";
import { SlidersHorizontal } from "@/v2/shared/components/atoms/v2-icon/icons";
import { V2BottomSheet } from "@/v2/shared/components/molecules/v2-bottom-sheet";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  buildPageChunks,
  findChunkIndexForPage,
} from "./V2TablePagination.helper";
import { PagePickerSection } from "./V2TablePagination.sheet-sections";
import { PageSizeSection } from "./V2TablePagination.size-section";

export interface V2TablePaginationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: number;
  totalPages: number;
  pageSize: number;
  total: number;
  from: number;
  to: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const V2TablePaginationSheet: React.FC<V2TablePaginationSheetProps> = ({
  open,
  onOpenChange,
  current,
  totalPages,
  pageSize,
  total,
  from,
  to,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useV2Translation();
  const [jumpInput, setJumpInput] = React.useState(String(current));
  const chunks = React.useMemo(() => buildPageChunks(totalPages), [totalPages]);
  const [activeChunkIndex, setActiveChunkIndex] = React.useState(() =>
    findChunkIndexForPage(chunks, current),
  );

  React.useEffect(() => {
    if (open) {
      setJumpInput(String(current));
      setActiveChunkIndex(findChunkIndexForPage(chunks, current));
    }
  }, [open, current, chunks]);

  const handleSelectPage = (target: number) => {
    const clamped = Math.min(Math.max(1, target), totalPages);
    onPageChange(clamped);
    onOpenChange(false);
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number.parseInt(jumpInput, 10);
    if (!Number.isNaN(parsed)) {
      handleSelectPage(parsed);
    }
  };

  const pageList = React.useMemo(() => {
    if (totalPages <= 20) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const chunk = chunks[activeChunkIndex] ?? chunks[0];
    if (!chunk) return [];
    return Array.from(
      { length: chunk.end - chunk.start + 1 },
      (_, i) => chunk.start + i,
    );
  }, [totalPages, chunks, activeChunkIndex]);

  return (
    <V2BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("v2.table.paginationSheetTitle", "Phân trang dữ liệu")}
      subtitle={t("v2.table.paginationSheetSubtitle", { from, to, total })}
      icon={<V2Icon icon={SlidersHorizontal} size={16} />}
      maxHeightClass="max-h-[85dvh] h-auto"
      bodyClassName="p-4 flex flex-col gap-5 overflow-y-auto"
      footer={
        <div className="pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
          <V2Button
            type="button"
            variant="primary"
            fullWidth
            className="h-11 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            {t("v2.table.done", "Xong")}
          </V2Button>
        </div>
      }
    >
      <PageSizeSection
        pageSize={pageSize}
        options={pageSizeOptions}
        onSelect={onPageSizeChange}
      />

      <PagePickerSection
        open={open}
        current={current}
        totalPages={totalPages}
        pageList={pageList}
        chunks={totalPages > 20 ? chunks : undefined}
        activeChunkIndex={activeChunkIndex}
        onChunkChange={setActiveChunkIndex}
        jumpInput={jumpInput}
        onJumpInputChange={setJumpInput}
        onSelectPage={handleSelectPage}
        onJumpSubmit={handleJumpSubmit}
      />

      <div className="flex flex-col gap-1.5 rounded-xl border border-border/50 bg-surface/50 p-3">
        <div className="flex items-center justify-between">
          <V2Text as="span" variant="caption" color="muted">
            {t("v2.table.currentRange", "Phạm vi hiển thị")}
          </V2Text>
          <V2Text
            as="span"
            variant="caption"
            weight="semibold"
            className="tabular-nums text-foreground"
          >
            {t("v2.table.pageInfo", { from, to, total })}
          </V2Text>
        </div>
        <div className="flex items-center justify-between">
          <V2Text as="span" variant="caption" color="muted">
            {t("v2.table.totalPagesLabel", "Tổng số trang")}
          </V2Text>
          <V2Text
            as="span"
            variant="caption"
            weight="semibold"
            className="tabular-nums text-foreground"
          >
            {totalPages}
          </V2Text>
        </div>
      </div>
    </V2BottomSheet>
  );
};
