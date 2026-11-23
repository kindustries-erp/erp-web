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
  /** Cột số cần tổng từ API: mọi cột có `summary` trừ nhãn "Tổng cộng" */
  const summaryKeys = React.useMemo(
    () =>
      tab.table.columns
        .filter(
          (column) => column.summary && column.summary.variant !== "label",
        )
        .map((column) => column.key),
    [tab.table.columns],
  );
  const queryWithSummaries = React.useMemo(
    () => ({ ...query, summaryKeys }),
    [query, summaryKeys],
  );
  const data = tab.useData(queryWithSummaries);

  const columns = React.useMemo(() => {
    const summaries = data.summaries;
    if (!summaries) return tab.table.columns;
    return tab.table.columns.map((column) => {
      if (!column.summary || summaries[column.key] === undefined) return column;
      const metric = summaries[column.key];
      return {
        ...column,
        summary: {
          ...column.summary,
          // Không tính được (null): tổng và lũy kế hiện "—", subtotal trang để bảng tự cộng
          total: metric?.total ?? null,
          pageSubtotal: metric?.pageSubtotal,
          cumulative: metric ? metric.cumulative : null,
        },
      };
    });
  }, [tab.table.columns, data.summaries]);

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
