import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Dropdown } from "@/v2/shared/components/molecules/v2-dropdown";
import { V2TableSelectCheckbox } from "@/v2/shared/components/molecules/v2-table-select-checkbox";
import { hasRowActions } from "@/v2/shared/components/molecules/v2-table-row-actions";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2MobileSlots } from "./V2StandardTable.mobile-slots";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";

export interface V2StandardTableMobileCardProps<T> {
  row: T;
  rowIndex: number;
  rowKey: string;
  startIndex: number;
  slots: V2MobileSlots<T>;
  isSelected: boolean;
  enableRowSelection?: boolean;
  rowActions?: (row: T) => V2RowActionGroup[];
  getRowClassName?: (row: T, index: number) => string | undefined;
  onToggleSelect: (key: string, checked: boolean) => void;
}

export function V2StandardTableMobileCard<T>({
  row,
  rowIndex,
  rowKey,
  startIndex,
  slots,
  isSelected,
  enableRowSelection,
  rowActions,
  getRowClassName,
  onToggleSelect,
}: V2StandardTableMobileCardProps<T>) {
  const { t } = useV2Translation();
  const index = startIndex + rowIndex + 1;
  const groups = rowActions?.(row) ?? [];
  const { title, subtitle, badge, badges, meta } = slots;
  const badgeList = badges && badges.length > 0 ? badges : badge ? [badge] : [];

  return (
    <li
      key={rowKey}
      data-state={isSelected ? "selected" : undefined}
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border/50 dark:border-white/[0.06] p-3 transition-all duration-200",
        "bg-[var(--drawer-section-bg,var(--surface))] backdrop-blur-[var(--drawer-section-blur,0px)]",
        "shadow-[0_2px_8px_-1px_rgba(0,0,0,0.06),0_1px_4px_-1px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.03)_inset]",
        "data-[state=selected]:border-primary/50 data-[state=selected]:bg-primary/5 dark:data-[state=selected]:border-primary/40 dark:data-[state=selected]:bg-primary/10",
        getRowClassName?.(row, index),
      )}
    >
      <div className="flex items-start gap-2 pb-2 border-b border-border/40 dark:border-white/[0.05]">
        {enableRowSelection && (
          <V2TableSelectCheckbox
            aria-label={t("v2.table.selectRow", "Chọn dòng")}
            checked={isSelected}
            onCheckedChange={(value) => onToggleSelect(rowKey, Boolean(value))}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <V2Text
              as="span"
              variant="caption"
              color="muted"
              className="tabular-nums font-medium text-[10px]"
            >
              #{index}
            </V2Text>
            {badgeList.map((col) => (
              <div key={col.key} className="inline-flex items-center shrink-0">
                {col.cell(row, index)}
              </div>
            ))}
          </div>
          <V2Text
            as="div"
            variant="body-sm"
            className="truncate font-semibold text-foreground"
          >
            {title?.cell(row, index)}
          </V2Text>
          {subtitle && (
            <V2Text
              as="div"
              variant="caption"
              color="muted"
              className="truncate mt-0.5"
            >
              {subtitle.cell(row, index)}
            </V2Text>
          )}
        </div>
        {hasRowActions(groups) && (
          <V2Dropdown
            groups={groups}
            align="end"
            trigger={
              <V2Button
                variant="ghost"
                size="icon-xs"
                aria-label={t("v2.table.moreActions", "Thao tác khác")}
              >
                <MoreHorizontal className="h-4 w-4" />
              </V2Button>
            }
          />
        )}
      </div>
      {meta.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 pt-0.5 text-xs">
          {meta.map((column) => (
            <div key={column.key} className="min-w-0">
              <dt>
                <V2Text
                  as="span"
                  variant="caption"
                  color="muted"
                  className="text-[11px] font-medium"
                >
                  {column.label}
                </V2Text>
              </dt>
              <dd className="truncate text-xs text-foreground [&>div]:items-start [&>div]:text-left">
                {column.cell(row, index)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  );
}
