import { useCallback, useState } from "react";
import { V2_IDLE_OPTIONS_STATE } from "@/v2/shared/components/molecules/v2-column-header-filter";
import type { V2FilterOptionsState } from "@/v2/shared/components/molecules/v2-column-header-filter";
import type { V2FetchOptions } from "@/v2/shared/types/v2-table";
import { useV2ColumnOptions } from "./V2StandardTable.options.hook";
import type { V2Column } from "./V2StandardTable.type";

export interface V2HeaderFilters {
  onOpenChange: (
    columnKey: string,
    open: boolean,
    committedSearch: string,
  ) => void;
  onOptionsSearchChange: (search: string) => void;
  optionsFor: (columnKey: string) => V2FilterOptionsState;
}

interface UseV2HeaderFiltersParams<T> {
  tableId: string;
  columnsByKey: Map<string, V2Column<T>>;
  fetchOptionsFor: (column: V2Column<T>) => V2FetchOptions | undefined;
  filtersStrFor: (columnKey: string) => string | undefined;
}

/** Chỉ một popup filter mở một lúc nên chỉ truy vấn options cho cột đang mở */
export function useV2HeaderFilters<T>({
  tableId,
  columnsByKey,
  fetchOptionsFor,
  filtersStrFor,
}: UseV2HeaderFiltersParams<T>): V2HeaderFilters {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [optionsSearch, setOptionsSearch] = useState("");
  const column = openKey ? columnsByKey.get(openKey) : undefined;

  const optionsState = useV2ColumnOptions({
    columnKey: openKey,
    fetchOptions: column ? fetchOptionsFor(column) : undefined,
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
