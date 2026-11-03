import { useMemo, useState } from "react";
import type { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import type { LedgerDisplayRow } from "./fifoTransform";
import { filterRowsExcluding } from "./fifoFilters";
import { buildOptionsMap } from "./fifoOptions";
import { sortRows } from "./fifoSort";
import { computeTotals } from "./fifoTotals";

type TableState = ReturnType<typeof useTableColumnState>;

/**
 * Trạng thái xem của bảng FIFO: lọc, sắp xếp, phân trang và tổng cộng.
 * Đầu vào là các dòng hiển thị và trạng thái cột; không gọi API.
 */
export function useFifoLedgerView(
  displayRows: LedgerDisplayRow[],
  tableState: TableState,
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { columnSearch, columnFilters, sorts } = tableState;

  const optionsMap = useMemo(
    () =>
      buildOptionsMap((colToSkip) =>
        filterRowsExcluding(
          displayRows,
          columnSearch,
          columnFilters,
          colToSkip,
        ),
      ),
    [displayRows, columnSearch, columnFilters],
  );

  const filteredRows = useMemo(
    () =>
      sortRows(
        filterRowsExcluding(displayRows, columnSearch, columnFilters, ""),
        sorts,
      ),
    [displayRows, columnSearch, columnFilters, sorts],
  );

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const totals = useMemo(
    () => computeTotals(filteredRows, sorts),
    [filteredRows, sorts],
  );

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    optionsMap,
    filteredRows,
    paginatedRows,
    totals,
  };
}
