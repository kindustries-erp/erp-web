import * as React from "react";
import {
  V2StandardTable,
  createInitialQuery,
} from "@/v2/shared/components/organisms/v2-standard-table";
import { useV2TableUrlState } from "@/v2/shared/hooks/useV2TableUrlState";
import type { V2ModuleListTab as V2ModuleListTabConfig } from "./V2ModulePage.type";

interface V2ModuleListTabProps<T> {
  tab: V2ModuleListTabConfig<T>;
}

/** Mount lazy theo tab: nơi duy nhất gọi `useData`, nên tab chưa mở thì chưa tải dữ liệu */
export function V2ModuleListTab<T>({ tab }: V2ModuleListTabProps<T>) {
  const { query, initialQuery, setQuery } = useV2TableUrlState({
    base: createInitialQuery(tab.initialQuery),
    prefix: tab.key,
  });
  const data = tab.useData(query);

  const columns = React.useMemo(
    () =>
      data.summaries
        ? tab.table.columns.map((column) =>
            column.summary && data.summaries?.[column.key] !== undefined
              ? {
                  ...column,
                  summary: {
                    ...column.summary,
                    total: data.summaries[column.key],
                  },
                }
              : column,
          )
        : tab.table.columns,
    [tab.table.columns, data.summaries],
  );

  const toolbar = React.useMemo(
    () =>
      tab.table.toolbar && data.refetch
        ? { onRefresh: data.refetch, ...tab.table.toolbar }
        : tab.table.toolbar,
    [tab.table.toolbar, data.refetch],
  );

  return (
    <V2StandardTable<T>
      {...tab.table}
      columns={columns}
      toolbar={toolbar}
      initialQuery={initialQuery}
      onQueryChange={setQuery}
      items={data.items}
      total={data.total}
      loading={data.loading}
    />
  );
}
