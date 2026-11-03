import * as React from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  Search,
  V2Button,
  V2Icon,
  V2Input,
  V2Text,
} from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { ColumnValueType, TableSortState } from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";
import { V2DateRangeSlot } from "./V2ColumnHeaderFilter.date-slot";
import { useHeaderFilterDraft } from "./V2ColumnHeaderFilter.hook";
import { V2OperatorFilterField } from "./V2ColumnHeaderFilter.operator";
import { getOperatorGroup } from "./V2ColumnHeaderFilter.operators";
import { V2FilterOptionsList } from "./V2ColumnHeaderFilter.options";
import type { V2ColumnHeaderFilterPanelProps } from "./V2ColumnHeaderFilter.type";

export const V2ColumnHeaderFilterPanel: React.FC<
  V2ColumnHeaderFilterPanelProps
> = (props) => {
  const { t } = useV2Translation();
  const { sort, onSortChange, onClose } = props;
  const draft = useHeaderFilterDraft(props);
  const isDate = props.valueType === ColumnValueType.DATE;
  const group = getOperatorGroup(props.valueType);

  const sortSection = (
    <div className="border-b border-border-light p-2">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/40 p-1">
        <V2Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 justify-center gap-1.5 rounded-md text-xs font-normal transition-all",
            sort === TableSortState.ASC
              ? "bg-surface font-medium text-foreground shadow-xs"
              : "text-muted-fg hover:bg-surface/40 hover:text-foreground",
          )}
          aria-label={t("v2.table.sortAsc", "Sắp xếp tăng dần")}
          onClick={() => {
            onSortChange(
              sort === TableSortState.ASC
                ? TableSortState.NONE
                : TableSortState.ASC,
            );
            onClose();
          }}
        >
          <V2Icon icon={ArrowDownAZ} size={14} className="shrink-0" />
          <V2Text variant="body-sm">
            {t("v2.table.sortAscShort", "Tăng dần")}
          </V2Text>
          {sort === TableSortState.ASC && (
            <V2Icon icon={Check} size={12} className="ml-0.5 text-primary" />
          )}
        </V2Button>

        <V2Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 justify-center gap-1.5 rounded-md text-xs font-normal transition-all",
            sort === TableSortState.DESC
              ? "bg-surface font-medium text-foreground shadow-xs"
              : "text-muted-fg hover:bg-surface/40 hover:text-foreground",
          )}
          aria-label={t("v2.table.sortDesc", "Sắp xếp giảm dần")}
          onClick={() => {
            onSortChange(
              sort === TableSortState.DESC
                ? TableSortState.NONE
                : TableSortState.DESC,
            );
            onClose();
          }}
        >
          <V2Icon icon={ArrowUpAZ} size={14} className="shrink-0" />
          <V2Text variant="body-sm">
            {t("v2.table.sortDescShort", "Giảm dần")}
          </V2Text>
          {sort === TableSortState.DESC && (
            <V2Icon icon={Check} size={12} className="ml-0.5 text-primary" />
          )}
        </V2Button>
      </div>
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
      <div className="border-b border-border-light p-2">
        <V2Input
          sizeVariant="sm"
          leftIcon={<V2Icon icon={Search} size={16} />}
          placeholder={t("v2.table.search", "Tìm kiếm...")}
          title={t("v2.table.searchHint")}
          aria-label={t("v2.table.search", "Tìm kiếm...")}
          value={draft.draftSearch}
          onChange={(event) => draft.setDraftSearch(event.target.value)}
          clearable
          onClear={() => draft.setDraftSearch("")}
        />
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
        <div className="border-t border-border-light p-2">
          <V2OperatorFilterField
            group={group}
            value={draft.pendingOperator}
            onChange={draft.setPendingOperator}
          />
        </div>
      )}
      <div className="flex items-center justify-between rounded-b-xl border-t border-border-light bg-muted/20 p-2">
        <V2Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs font-medium text-muted-fg hover:bg-muted/50 hover:text-foreground"
          onClick={draft.clear}
        >
          <V2Text variant="body-sm" color="inherit">
            {t("v2.table.clearFilter", "Xóa bộ lọc")}
          </V2Text>
        </V2Button>
        <V2Button
          variant="primary"
          size="sm"
          className="h-7 px-3 text-xs font-medium"
          onClick={draft.apply}
        >
          <V2Text
            variant="body-sm"
            color="inherit"
            className="text-primary-fg font-medium"
          >
            {t("v2.table.apply", "Áp dụng")}
          </V2Text>
        </V2Button>
      </div>
    </div>
  );
};
