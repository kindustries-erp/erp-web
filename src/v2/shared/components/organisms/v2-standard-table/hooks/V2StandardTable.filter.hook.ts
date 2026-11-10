import { useCallback, useState } from "react";
import { V2_IDLE_OPTIONS_STATE } from "@/v2/shared/components/molecules/v2-column-header-filter";
import type { V2FilterOptionsState } from "@/v2/shared/components/molecules/v2-column-header-filter";
import type { V2FetchOptions } from "@/v2/shared/types/v2-table";
import type { V2FilterColumn } from "../filterpanel/V2StandardTable.filtercards";
import { useV2ColumnOptions } from "./V2StandardTable.options.hook";

export interface V2HeaderFilters {
  onOpenChange: (
    columnKey: string,
    open: boolean,
    committedSearch: string,
  ) => void;
  onOptionsSearchChange: (search: string) => void;
  optionsFor: (columnKey: string) => V2FilterOptionsState;
}

interface UseV2HeaderFiltersParams {
  tableId: string;
  columnsByKey: Map<string, V2FilterColumn>;
  /** Nguồn options theo khóa cột (bảng hoặc bản nháp trong dialog dùng chung) */
  fetchOptionsForKey: (columnKey: string) => V2FetchOptions | undefined;
  filtersStrFor: (columnKey: string) => string | undefined;
}

/** Chỉ một popup filter mở một lúc nên chỉ truy vấn options cho cột đang mở */
export function useV2HeaderFilters({
  tableId,
  columnsByKey,
  fetchOptionsForKey,
  filtersStrFor,
}: UseV2HeaderFiltersParams): V2HeaderFilters {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [optionsSearch, setOptionsSearch] = useState("");
  const column = openKey ? columnsByKey.get(openKey) : undefined;

  const optionsState = useV2ColumnOptions({
    columnKey: openKey,
    fetchOptions: openKey ? fetchOptionsForKey(openKey) : undefined,
    search: optionsSearch,
    filtersStr: openKey ? filtersStrFor(openKey) : undefined,
    showBlankOption: column?.filter?.showBlankOption,
    queryKeyPrefix: `v2-table-options:${tableId}`,
  });

  const onOpenChange = useCallback(
    (columnKey: string, open: boolean, committedSearch: string) => {
      if (open) {
        setOpenKey(columnKey);
        setOptionsSearch(committedSearch);
      } else {
        setOpenKey((current) => (current === columnKey ? null : current));
      }
    },
    [],
  );

  const optionsFor = useCallback(
    (columnKey: string) =>
      columnKey === openKey ? optionsState : V2_IDLE_OPTIONS_STATE,
    [openKey, optionsState],
  );

  return { onOpenChange, onOptionsSearchChange: setOptionsSearch, optionsFor };
}
