import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import type { V2TableState } from "../hooks/V2StandardTable.state.hook";
import type { V2FilterPresetEditorSource } from "../hooks/V2StandardTable.filterpresets.hook";
import { V2TableFilterCards } from "../filterpanel/V2StandardTable.filtercards";
import { buildActiveFilterChips } from "../utils/v2ActiveFilterChips";

export interface V2FilterPresetEditorProps {
  source: V2FilterPresetEditorSource;
  /** Bản nháp điều kiện của hộp thoại (state bảng riêng, không đẩy lên bảng) */
  table: V2TableState;
  /** Dropdown options của bản nháp (cùng cơ chế với popup lọc cột) */
  filters: V2HeaderFilters;
}

/** Dựng điều kiện lọc theo cột ngay trong hộp thoại bộ lọc, dùng lại card của panel lọc */
export const V2FilterPresetEditor: React.FC<V2FilterPresetEditorProps> = ({
  source,
  table,
  filters,
}) => {
  const { t } = useV2Translation();
  const [expandedKey, setExpandedKey] = React.useState<string | null>(null);
  const chips = React.useMemo(
    () => buildActiveFilterChips(table.query, source.columns, t),
    [table.query, source.columns, t],
  );
  const activeKeys = React.useMemo(
    () => new Set(chips.map((chip) => chip.columnKey)),
    [chips],
  );

  const setExpanded = (key: string, open: boolean) => {
    // Chỉ một card mở một lúc, giống panel lọc bên phải
    if (open && expandedKey && expandedKey !== key) {
      filters.onOpenChange(expandedKey, false, "");
    }
    filters.onOpenChange(key, open, table.query.columnSearch[key] ?? "");
    setExpandedKey((current) =>
      open ? key : current === key ? null : current,
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <V2Text variant="label">
          {chips.length > 0
            ? t("v2.table.activeFilters", { count: chips.length })
            : t("v2.table.filterPresetConditions", "Điều kiện lọc")}
        </V2Text>
        <div className="flex gap-1">
          <V2Button
            type="button"
            variant="ghost"
            size="xs"
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
            onClick={table.resetAll}
          >
            {t("v2.table.filterPresetClearConditions", "Xóa điều kiện")}
          </V2Button>
        </div>
      </div>
      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
        <V2TableFilterCards
          columns={source.columns}
          state={table}
          filters={filters}
          activeKeys={activeKeys}
          expandedKey={expandedKey}
          onExpandedChange={setExpanded}
        />
      </div>
    </div>
  );
};
