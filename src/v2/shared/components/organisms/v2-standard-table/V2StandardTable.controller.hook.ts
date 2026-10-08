import { useEffect, useMemo } from "react";
import { useV2RowSelection } from "./V2StandardTable.selection";
import { useV2TableState } from "./V2StandardTable.state.hook";
import { useV2TableView } from "./V2StandardTable.view.hook";
import type { V2StandardTableProps } from "./V2StandardTable.type";

/** State, dữ liệu hiển thị và chọn dòng dùng chung cho bản desktop và mobile */
export function useV2TableController<T>(props: V2StandardTableProps<T>) {
  const mode = props.mode ?? "server";
  const state = useV2TableState({
    initialQuery: props.initialQuery,
    onQueryChange: props.onQueryChange,
  });
  const columnsByKey = useMemo(
    () => new Map(props.columns.map((column) => [column.key, column])),
    [props.columns],
  );
  const view = useV2TableView({
    mode,
    items: props.items,
    total: props.total,
    columns: props.columns,
    query: state.query,
    serverFetch: props.fetchOptions,
  });
  const selection = useV2RowSelection(
    props.selectedKeys,
    props.onSelectionChange,
  );

  const totalPages = Math.max(1, Math.ceil(view.total / state.query.pageSize));
  const { setPage } = state;
  useEffect(() => {
    if (mode === "client" && state.query.page > totalPages) {
      setPage(totalPages);
    }
  }, [mode, state.query.page, totalPages, setPage]);

  return { mode, state, columnsByKey, view, selection };
}
