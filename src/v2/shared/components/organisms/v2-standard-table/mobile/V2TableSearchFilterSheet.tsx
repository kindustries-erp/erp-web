import * as React from "react";
import { V2Button, V2Icon } from "@/v2/shared/components/atoms";
import { SlidersHorizontal } from "@/v2/shared/components/atoms/v2-icon/icons";
import { V2BottomSheet } from "@/v2/shared/components/molecules/v2-bottom-sheet";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2TableFilterDrawerBody } from "../filterpanel/filterdrawer/V2TableFilterDrawer.body";
import type { V2TableFilterDrawerProps } from "../filterpanel/filterdrawer/V2TableFilterDrawer.type";
import type { V2TableToolbarConfig } from "../V2StandardTable.type";
import {
  FilterGroupSection,
  SearchSection,
} from "./V2TableSearchFilterSheet.sections";

export interface V2TableSearchFilterSheetProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search?: { value: string; onChange: (text: string) => void };
  searchPlaceholder?: string;
  filterGroup?: V2TableToolbarConfig["filterGroup"];
  activeFilterCount: number;
  onClearAllFilters: () => void;
  filterDrawer: V2TableFilterDrawerProps<T>;
}

export function V2TableSearchFilterSheet<T>({
  open,
  onOpenChange,
  search,
  searchPlaceholder,
  filterGroup,
  activeFilterCount,
  onClearAllFilters,
  filterDrawer,
}: V2TableSearchFilterSheetProps<T>) {
  const { t } = useV2Translation();
  const [draftSearch, setDraftSearch] = React.useState(search?.value ?? "");

  React.useEffect(() => {
    setDraftSearch(search?.value ?? "");
  }, [search?.value, open]);

  const hasFilterableCols = filterDrawer.columns.some((c) => Boolean(c.filter));
  const hasAnyActive =
    Boolean(draftSearch.trim()) ||
    activeFilterCount > 0 ||
    Boolean(
      filterGroup && filterGroup.activeKey !== (filterGroup.allKey ?? "all"),
    );

  const handleApply = () => {
    if (search && draftSearch !== search.value) {
      search.onChange(draftSearch);
    }
    onOpenChange(false);
  };

  const handleClearAll = () => {
    setDraftSearch("");
    search?.onChange("");
    onClearAllFilters();
    if (filterGroup) {
      filterGroup.onChange(filterGroup.allKey ?? "all");
    }
  };

  return (
    <V2BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("v2.table.searchAndFilter", "Tìm kiếm & Bộ lọc")}
      icon={<V2Icon icon={SlidersHorizontal} size={16} />}
      maxHeightClass="h-[85dvh] max-h-[85dvh]"
      bodyClassName="flex min-h-0 flex-col gap-5 overflow-y-auto p-4"
      footer={
        <div className="flex items-center gap-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
          <V2Button
            type="button"
            variant="outline"
            disabled={!hasAnyActive}
            onClick={handleClearAll}
            className="h-11 flex-1 rounded-xl"
          >
            {t("v2.table.clearAll", "Xóa tất cả")}
          </V2Button>
          <V2Button
            type="button"
            variant="primary"
            onClick={handleApply}
            className="h-11 flex-1 rounded-xl"
          >
            {t("v2.table.apply", "Áp dụng")}
          </V2Button>
        </div>
      }
    >
      {search && (
        <SearchSection
          value={draftSearch}
          placeholder={searchPlaceholder}
          onChange={setDraftSearch}
          onClear={() => {
            setDraftSearch("");
            search.onChange("");
          }}
          onSubmit={handleApply}
        />
      )}

      {filterGroup && filterGroup.items.length > 0 && (
        <FilterGroupSection filterGroup={filterGroup} />
      )}

      {hasFilterableCols && (
        <section className="flex flex-col gap-2">
          <V2TableFilterDrawerBody {...filterDrawer} tab="columns" />
        </section>
      )}
    </V2BottomSheet>
  );
}
