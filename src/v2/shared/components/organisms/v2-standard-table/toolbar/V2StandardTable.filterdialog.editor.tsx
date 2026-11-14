import * as React from "react";
import { Copy, RotateCcw } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2FilterColumnSearch } from "@/v2/shared/components/molecules/v2-filter-column-search";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import type { V2TableState } from "../hooks/V2StandardTable.state.hook";
import type { V2FilterPresetEditorSource } from "../hooks/V2StandardTable.filterpresets.hook";
import type { V2FilterColumn } from "../filterpanel/V2StandardTable.filtercards";
import { V2TableFilterCards } from "../filterpanel/V2StandardTable.filtercards";
import { V2TableFilterChips } from "../filterpanel/V2StandardTable.filterchips";
import { useV2FilterCardsState } from "../filterpanel/V2StandardTable.filtercards.hook";
import { buildActiveFilterChips } from "../utils/v2ActiveFilterChips";

export interface V2FilterPresetEditorProps {
  source: V2FilterPresetEditorSource;
  /** Bản nháp điều kiện của hộp thoại (state bảng riêng, không đẩy lên bảng) */
  table: V2TableState;
  /** Dropdown options của bản nháp (cùng cơ chế với popup lọc cột) */
  filters: V2HeaderFilters;
}

const canFilterColumn = (column: V2FilterColumn): boolean =>
  Boolean(column.filter);

/** Dựng điều kiện lọc theo cột ngay trong hộp thoại bộ lọc; dùng chung card, chip và ô tìm cột với panel lọc */
export const V2FilterPresetEditor: React.FC<V2FilterPresetEditorProps> = ({
  source,
  table,
  filters,
}) => {
  const { t } = useV2Translation();
  const { query } = table;
  const committedSearchOf = React.useCallback(
    (columnKey: string) => query.columnSearch[columnKey] ?? "",
    [query.columnSearch],
  );
  const cards = useV2FilterCardsState({
    columns: source.columns,
    filters,
    canFilter: canFilterColumn,
    committedSearchOf,
  });
  const chips = React.useMemo(
    () => buildActiveFilterChips(query, source.columns, t),
    [query, source.columns, t],
  );
  const activeKeys = React.useMemo(
    () => new Set(chips.map((chip) => chip.columnKey)),
    [chips],
  );
  const hasConditions = chips.length > 0;

  const reveal = (key: string) => {
    cards.setExpanded(key, true);
    window.requestAnimationFrame(() =>
      document
        .getElementById(`filter-card-${key}`)
        ?.scrollIntoView?.({ behavior: "smooth", block: "nearest" }),
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <V2Text variant="label">
          {hasConditions
            ? t("v2.table.activeFilters", { count: chips.length })
            : t("v2.table.filterPresetConditions", "Điều kiện lọc")}
        </V2Text>
        <div className="flex flex-wrap gap-1">
          <V2Button
            type="button"
            variant="outline"
            size="xs"
            leftIcon={<Copy className="h-3 w-3" />}
            onClick={() => table.applyQuery(source.tableQuery)}
          >
            {t(
              "v2.table.filterPresetUseCurrent",
              "Dùng điều kiện đang áp dụng",
            )}
          </V2Button>
          <V2Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={!hasConditions}
            leftIcon={<RotateCcw className="h-3 w-3" />}
            onClick={table.resetAll}
            className="hover:text-destructive"
          >
            {t("v2.table.filterPresetClearConditions", "Xóa điều kiện")}
          </V2Button>
        </div>
      </div>
      <V2FilterColumnSearch
        value={cards.colSearch}
        onChange={cards.setColSearch}
      />
      {hasConditions && (
        <V2TableFilterChips
          chips={chips}
          onReveal={reveal}
          onRemove={table.clearColumn}
        />
      )}
      {/* Grid: card không bị co theo chiều cao vùng cuộn, nên nội dung không bị cắt */}
      <div className="grid max-h-[min(22rem,50vh)] grid-cols-1 gap-1.5 overflow-y-auto pr-1">
        {cards.visibleColumns.length === 0 ? (
          <V2Text as="p" variant="caption" className="py-6 text-center">
            {t("v2.table.noMatchingColumns", "Không có cột phù hợp")}
          </V2Text>
        ) : (
          <V2TableFilterCards
            columns={cards.visibleColumns}
            state={table}
            filters={filters}
            activeKeys={activeKeys}
            expandedKey={cards.expandedKey}
            onExpandedChange={cards.setExpanded}
          />
        )}
      </div>
    </div>
  );
};
