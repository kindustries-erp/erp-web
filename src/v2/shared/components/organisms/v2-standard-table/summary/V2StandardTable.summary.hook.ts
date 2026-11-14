import * as React from "react";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import {
  buildSummarySignature,
  computeClientSummary,
  createServerSummaryState,
  cumulativeFromPages,
  readSummaryNumber,
  recordPageSum,
  sumRows,
} from "./V2StandardTable.summary";
import type {
  V2ColumnSummaryValues,
  V2ServerSummaryState,
} from "./V2StandardTable.summary";
import type { V2Column, V2TableMode } from "../V2StandardTable.type";

interface UseV2TableSummaryParams<T> {
  columns: V2Column<T>[];
  mode: V2TableMode;
  query: V2TableQuery;
  /** Client: toàn bộ dòng đã lọc/sắp xếp; server: dữ liệu trang hiện tại */
  allRows: T[];
  /** Dòng đang hiển thị trên trang */
  pageRows: T[];
  loading: boolean;
}

/**
 * Giá trị ô tổng theo `key` của cột có `summary`.
 * Client tính trực tiếp; server tích lũy theo trang (ghi trong effect sau khi dữ liệu trang đã về).
 */
export function useV2TableSummary<T>({
  columns,
  mode,
  query,
  allRows,
  pageRows,
  loading,
}: UseV2TableSummaryParams<T>): Record<string, V2ColumnSummaryValues> {
  const summaryColumns = React.useMemo(
    () => columns.filter((column) => column.summary),
    [columns],
  );
  const signature = buildSummarySignature(query);
  const serverStates = React.useRef<Record<string, V2ServerSummaryState>>({});

  const pageSums = React.useMemo(
    () =>
      Object.fromEntries(
        summaryColumns.map((column) => [
          column.key,
          sumRows(pageRows, (row) => readSummaryNumber(column, row)),
        ]),
      ),
    [summaryColumns, pageRows],
  );

  React.useEffect(() => {
    if (mode !== "server" || loading) return;
    for (const column of summaryColumns) {
      const prev =
        serverStates.current[column.key] ?? createServerSummaryState();
      serverStates.current[column.key] = recordPageSum(
        prev,
        signature,
        query.page,
        pageSums[column.key],
      );
    }
  }, [mode, loading, signature, query.page, pageSums, summaryColumns]);

  return React.useMemo(() => {
    const values: Record<string, V2ColumnSummaryValues> = {};
    for (const column of summaryColumns) {
      const read = (row: T) => readSummaryNumber(column, row);
      if (mode === "client") {
        values[column.key] = computeClientSummary(
          read,
          allRows,
          pageRows,
          query.page,
          query.pageSize,
        );
        continue;
      }
      const server = column.summary;
      const clientPageValue = pageSums[column.key];
      values[column.key] = {
        // Subtotal trang: ưu tiên số của API, không có thì cộng theo dòng đang hiển thị
        pageValue:
          typeof server?.pageSubtotal === "number"
            ? server.pageSubtotal
            : clientPageValue,
        // undefined: chưa có số từ API (giữ 0); null: API không tính được → "—"
        totalValue: server?.total === undefined ? 0 : server.total,
        // Lũy kế: ưu tiên số/null của API; undefined thì tích lũy theo các trang đã xem
        cumulativeValue:
          server?.cumulative !== undefined
            ? server.cumulative
            : cumulativeFromPages(
                serverStates.current[column.key] ?? createServerSummaryState(),
                signature,
                query.page,
                clientPageValue,
              ),
      };
    }
    return values;
  }, [
    summaryColumns,
    mode,
    allRows,
    pageRows,
    pageSums,
    query.page,
    query.pageSize,
    signature,
  ]);
}
