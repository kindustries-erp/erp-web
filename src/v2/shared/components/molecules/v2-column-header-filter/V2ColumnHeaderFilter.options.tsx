import * as React from "react";
import { Loader2 } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Checkbox } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import {
  areAllVisibleSelected,
  isAllMatching,
  resolveOptionLabel,
  toggleAllMatching,
  toggleAllVisible,
  toggleValue,
} from "./V2ColumnHeaderFilter.selection";
import type { V2FilterOptionsState } from "./V2ColumnHeaderFilter.type";

const NEAR_BOTTOM_PX = 24;

interface OptionsProps {
  state: V2FilterOptionsState;
  selected: string[];
  /** Từ khóa đang nhập: có từ khóa thì "Chọn tất cả" áp cho kết quả tìm kiếm */
  search: string;
  formatOptionLabel?: (value: string) => string;
  onChange: (values: string[]) => void;
  className?: string;
}

const ROW =
  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted";

export const V2FilterOptionsList: React.FC<OptionsProps> = ({
  state,
  selected,
  search,
  formatOptionLabel,
  onChange,
  className,
}) => {
  const { t } = useV2Translation();
  const { options, status } = state;
  const allMatching = isAllMatching(selected);
  const hasSearch = search.trim() !== "";
  const blankLabel = t("v2.table.blank", "(Trống)");

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const nearBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - NEAR_BOTTOM_PX;
    if (nearBottom && state.hasNextPage && !state.isFetchingNextPage) {
      state.onLoadMore();
    }
  };

  if (status === "loading" && options.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-fg">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t("v2.table.loadingOptions", "Đang tải lựa chọn...")}</span>
      </div>
    );
  }
  if (status === "error") {
    return (
      <p className="p-4 text-center text-xs text-destructive">
        {t("v2.common.error", "Đã xảy ra lỗi")}
      </p>
    );
  }
  if (options.length === 0) {
    return (
      <p className="p-4 text-center text-xs text-muted-fg">
        {t("v2.table.noOptions", "Không có lựa chọn")}
      </p>
    );
  }

  return (
    <div
      data-testid="v2-options-scroll"
      onScroll={handleScroll}
      className={cn("flex max-h-48 flex-col overflow-y-auto", className)}
    >
      <label className={ROW}>
        <Checkbox
          checked={
            hasSearch ? allMatching : areAllVisibleSelected(selected, options)
          }
          onCheckedChange={() =>
            onChange(
              hasSearch
                ? toggleAllMatching(selected, search)
                : toggleAllVisible(selected, options),
            )
          }
        />
        <span className="text-xs font-medium">
          {hasSearch
            ? t("v2.table.selectAllMatching", "(Chọn tất cả kết quả tìm kiếm)")
            : t("v2.table.selectAllVisible", "(Chọn tất cả đang hiển thị)")}
        </span>
      </label>
      {options.map((option) => {
        const label = resolveOptionLabel(option, blankLabel, formatOptionLabel);
        return (
          <label key={option.value} className={ROW}>
            <Checkbox
              checked={!allMatching && selected.includes(option.value)}
              onCheckedChange={() =>
                onChange(toggleValue(selected, option.value))
              }
            />
            <span className="truncate text-xs" title={label}>
              {label}
            </span>
          </label>
        );
      })}
      {state.isFetchingNextPage && (
        <div className="flex justify-center p-2 text-muted-fg">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        </div>
      )}
    </div>
  );
};
