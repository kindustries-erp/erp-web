import * as React from "react";
import type { V2FilterGroup, V2FilterGroupItem } from "@/v2/shared/components";
import { useV2SearchParams } from "@/v2/shared/hooks/useV2SearchParams";
import { updateV2SearchParams } from "@/v2/shared/utils/v2Url";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { getLoanStatusOptions } from "@/v2/core/loans";
import type { LoansListFilter } from "../../api";
import { LOAN_VIEW_VISIBILITY, LOANS_TABLE_ID } from "./loansList.config";
import { LoansFilterKey, LoansTabKey, LoansViewKey } from "./loansList.enum";

type Translate = (key: string, fallback?: string) => string;

const LOANS_TAB_VALUES = new Set<string>(Object.values(LoansTabKey));

const isLoansTabKey = (value: string | null): value is LoansTabKey =>
  value !== null && LOANS_TAB_VALUES.has(value);

/** Tab đang mở đồng bộ với URL `?tab=simulator|projection|list`. */
export function useLoansActiveTab(
  defaultTab: LoansTabKey = LoansTabKey.SIMULATOR,
) {
  const urlTab = useV2SearchParams().get("tab");
  const [activeTab, setActiveTabState] = React.useState<LoansTabKey>(() =>
    isLoansTabKey(urlTab) ? urlTab : defaultTab,
  );

  React.useEffect(() => {
    if (isLoansTabKey(urlTab)) setActiveTabState(urlTab);
  }, [urlTab]);

  const setActiveTab = React.useCallback((next: string) => {
    if (!isLoansTabKey(next)) return;
    setActiveTabState(next);
    updateV2SearchParams((search) => {
      search.set("tab", next);
    });
  }, []);

  return [activeTab, setActiveTab] as const;
}

/** Trạng thái bộ lọc có sẵn (`Tất cả`, trạng thái, `Đã xóa mềm`) và chế độ xem cột bảng loans. */
export function useLoansListFilterAndView(t: Translate) {
  const [filterKey, setFilterKey] = React.useState<string>(LoansFilterKey.ALL);
  const [resetCount, setResetCount] = React.useState(0);
  const [view, setView] = React.useState<LoansViewKey>(() => {
    const saved =
      useV2TablePreferencesStore.getState().tables[LOANS_TABLE_ID]?.views
        ?.activeKey;
    return saved === LoansViewKey.ALL
      ? LoansViewKey.ALL
      : LoansViewKey.OVERVIEW;
  });
  const [viewKey, setViewKey] = React.useState(0);

  React.useEffect(() => {
    const overview = LOAN_VIEW_VISIBILITY[LoansViewKey.OVERVIEW];
    if (
      !useV2TablePreferencesStore.getState().tables[LOANS_TABLE_ID]?.columns &&
      overview
    ) {
      applyV2SystemView(LOANS_TABLE_ID, LoansViewKey.OVERVIEW, overview);
    }
  }, []);

  const changeFilter = React.useCallback((key: string) => {
    setFilterKey(key);
    setResetCount((count) => count + 1);
  }, []);

  const selectView = React.useCallback((key: string) => {
    if (key !== LoansViewKey.OVERVIEW && key !== LoansViewKey.ALL) return;
    setView(key);
    const visibility = LOAN_VIEW_VISIBILITY[key];
    if (visibility) {
      applyV2SystemView(LOANS_TABLE_ID, key, visibility);
      setViewKey((count) => count + 1);
    }
  }, []);

  const isDeleted = filterKey === LoansFilterKey.DELETED;
  const filter = React.useMemo<LoansListFilter>(() => {
    if (isDeleted) return { deleted: "only" };
    if (filterKey === LoansFilterKey.ALL) return {};
    return { status: filterKey };
  }, [filterKey, isDeleted]);

  const filterGroup = React.useMemo<V2FilterGroup>(() => {
    const statusItems = getLoanStatusOptions(t);
    const items: V2FilterGroupItem[] = [
      {
        key: LoansFilterKey.ALL,
        label: t("v2.loans.filters.all", "Tất cả"),
      },
      ...statusItems.map((item) => ({ key: item.value, label: item.label })),
      {
        key: LoansFilterKey.DELETED,
        label: t("v2.loans.filters.deleted", "Đã xóa mềm"),
      },
    ];
    return {
      title: t("v2.loans.filters.title", "Bộ lọc có sẵn"),
      items,
      activeKey: filterKey,
      onChange: changeFilter,
      allKey: LoansFilterKey.ALL,
    };
  }, [changeFilter, filterKey, t]);

  const viewModes = React.useMemo(
    () => ({
      items: [
        {
          key: LoansViewKey.OVERVIEW,
          label: t("v2.loans.views.overview", "Tổng quan"),
          isSystem: true,
        },
        {
          key: LoansViewKey.ALL,
          label: t("v2.loans.views.all", "Tất cả cột"),
          isSystem: true,
        },
      ],
      activeKey: view,
      onSelect: selectView,
    }),
    [selectView, t, view],
  );

  return {
    filter,
    isDeleted,
    filterGroup,
    viewModes,
    resetKey: `${LOANS_TABLE_ID}-${viewKey}-${resetCount}`,
  };
}
