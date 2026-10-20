import * as React from "react";
import { ArrowDownAZ, ArrowUpAZ, Check, Search, X } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Input } from "@/v2/shared/ui";
import { ColumnValueType, TableSortState } from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";
import { V2DateRangeSlot } from "./V2ColumnHeaderFilter.date-slot";
import { useHeaderFilterDraft } from "./V2ColumnHeaderFilter.hook";
import { V2OperatorFilterField } from "./V2ColumnHeaderFilter.operator";
import { getOperatorGroup } from "./V2ColumnHeaderFilter.operators";
import { V2FilterOptionsList } from "./V2ColumnHeaderFilter.options";
import type { V2ColumnHeaderFilterPanelProps } from "./V2ColumnHeaderFilter.type";

const SORT_BUTTON = "h-8 justify-start rounded-sm font-normal";
const ACTIVE_SORT = "bg-primary/10 font-medium text-primary";

export const V2ColumnHeaderFilterPanel: React.FC<
  V2ColumnHeaderFilterPanelProps
> = (props) => {
  const { t } = useV2Translation();
  const { sort, onSortChange, onClose } = props;
  const draft = useHeaderFilterDraft(props);
  const isDate = props.valueType === ColumnValueType.DATE;
  const group = getOperatorGroup(props.valueType);

  const sortButton = (
    direction: TableSortState.ASC | TableSortState.DESC,
    label: string,
    icon: React.ReactNode,
  ) => (
    <V2Button
      variant="ghost"
      size="sm"
      className={cn(SORT_BUTTON, sort === direction && ACTIVE_SORT)}
      leftIcon={icon}
      onClick={() => {
        onSortChange(sort === direction ? TableSortState.NONE : direction);
        onClose();
      }}
    >
      <span className="flex-1 text-left">{label}</span>
      {sort === direction && <Check className="ml-auto h-3.5 w-3.5" />}
    </V2Button>
  );

  const sortSection = (
    <div className="flex flex-col gap-1 border-b border-border p-2">
      {sortButton(
        TableSortState.ASC,
        t("v2.table.sortAsc", "Sắp xếp tăng dần"),
        <ArrowDownAZ className="h-3.5 w-3.5" />,
      )}
      {sortButton(
        TableSortState.DESC,
        t("v2.table.sortDesc", "Sắp xếp giảm dần"),
        <ArrowUpAZ className="h-3.5 w-3.5" />,
      )}
    </div>
  );

  if (isDate) {
    return (
      <div className="flex flex-col">
        {sortSection}
        <div className="p-2">
          <V2DateRangeSlot
            value={props.dateRange}
            onChange={props.onDateRangeChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      onKeyDown={(event) => {
        if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
          event.preventDefault();
          draft.apply();
        }
      }}
    >
      {sortSection}
      <div className="border-b border-border p-2">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-muted-fg" />
          <Input
            className="h-8 pl-8 pr-8 text-xs"
            placeholder={t("v2.table.search", "Tìm kiếm...")}
            title={t("v2.table.searchHint")}
            aria-label={t("v2.table.search", "Tìm kiếm...")}
            value={draft.draftSearch}
            onChange={(event) => draft.setDraftSearch(event.target.value)}
          />
          {draft.draftSearch !== "" && (
            <V2Button
              variant="ghost"
              size="icon-xs"
              className="absolute right-1 h-6 w-6 text-muted-fg"
              aria-label={t("v2.table.clearSearch", "Xóa tìm kiếm")}
              onClick={() => draft.setDraftSearch("")}
            >
              <X className="h-3.5 w-3.5" />
            </V2Button>
          )}
        </div>
      </div>
      <div className="p-2">
        <V2FilterOptionsList
          state={props.optionsState}
          selected={draft.pendingSelected}
          search={draft.draftSearch}
          formatOptionLabel={props.formatOptionLabel}
          onChange={draft.setPendingSelected}
        />
      </div>
      {group && group !== "date" && (
        <div className="border-t border-border p-2">
          <V2OperatorFilterField
            group={group}
            value={draft.pendingOperator}
            onChange={draft.setPendingOperator}
          />
        </div>
      )}
      <div className="flex items-center justify-between rounded-b-xl border-t border-border bg-muted/30 p-2">
        <V2Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-fg hover:bg-transparent hover:text-foreground"
          onClick={draft.clear}
        >
          {t("v2.table.clearFilter", "Xóa bộ lọc")}
        </V2Button>
        <V2Button
          variant="primary"
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={draft.apply}
        >
          {t("v2.table.apply", "Áp dụng")}
        </V2Button>
      </div>
    </div>
  );
};
