import React from "react";
import { useTranslation } from "react-i18next";
import { TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  FIFO_DATE_HEADER_CLASS,
  FIFO_GENERAL_GROUP,
  FIFO_GROUP_HEADERS,
  FIFO_HEADER_COLUMNS,
  FIFO_PERFORMANCE_GROUP,
} from "./fifoColumns";
import { FifoHeaderCell } from "./FifoHeaderCell";

type TableState = ReturnType<typeof useTableColumnState>;

interface FifoTableHeaderProps {
  tableState: TableState;
  optionsMap: Record<string, { label: string; value: string }[]>;
}

const GROUP_ROW_CLASS = "hover:bg-transparent border-b-0";
const COLUMN_ROW_CLASS =
  "hover:bg-transparent border-b-0 shadow-[0_1px_0_0_var(--border-light)]";
const HASH_CELL_CLASS =
  "px-3 py-2 border-r border-slate-200 font-semibold text-center w-10 bg-slate-100/75 shadow-[0_1px_0_0_var(--border-light)]";

/** Hàng nhóm (NHẬP/XUẤT/TỒN/HIỆU QUẢ) và hàng tiêu đề cột của bảng FIFO. */
export function FifoTableHeader({
  tableState,
  optionsMap,
}: FifoTableHeaderProps) {
  const { t } = useTranslation(["vinfastParts", "common"]);

  return (
    <TableHeader className="sticky top-0 z-10 table-header-glass text-slate-700 border-b border-border">
      <TableRow className={GROUP_ROW_CLASS}>
        <TableHead rowSpan={2} className={HASH_CELL_CLASS}>
          #
        </TableHead>
        <TableHead
          colSpan={FIFO_GENERAL_GROUP.colSpan}
          className={FIFO_GENERAL_GROUP.className}
        >
          {t(FIFO_GENERAL_GROUP.titleKey, FIFO_GENERAL_GROUP.titleDefault)}
        </TableHead>
        {FIFO_GROUP_HEADERS.map((group) => (
          <TableHead
            key={group.titleKey}
            colSpan={group.colSpan}
            className={group.className}
          >
            {t(group.titleKey, group.titleDefault)}
          </TableHead>
        ))}
        <TableHead
          colSpan={FIFO_PERFORMANCE_GROUP.colSpan}
          className={FIFO_PERFORMANCE_GROUP.className}
        >
          {t(
            FIFO_PERFORMANCE_GROUP.titleKey,
            FIFO_PERFORMANCE_GROUP.titleDefault,
          )}
        </TableHead>
      </TableRow>

      <TableRow className={COLUMN_ROW_CLASS}>
        <TableHead className={FIFO_DATE_HEADER_CLASS}>
          <TableColumnHeaderFilter
            title={t("common:date", "Ngày")}
            align="center"
            hideFilter={true}
            hideFilterList={true}
            hideFooter={true}
            hideSort={true}
            sortState="none"
            onSortChange={() => {}}
            searchValue={tableState.columnSearch["transactionDate"] || ""}
            onSearchChange={(val) =>
              tableState.setColumnSearch("transactionDate", val)
            }
            selectedFilters={[]}
            onFilterChange={() => {}}
            dateRangeSlot={({ close }) => {
              const val = tableState.columnSearch["transactionDate"] || "";
              const [from = "", to = ""] = val.split("|");
              return (
                <DateRangeColumnSlot
                  dateFrom={from}
                  dateTo={to}
                  onChange={(f, t) => {
                    const next = f || t ? `${f}|${t}` : "";
                    tableState.setColumnSearch("transactionDate", next);
                    close();
                  }}
                />
              );
            }}
          />
        </TableHead>
        {FIFO_HEADER_COLUMNS.map((column, index) => (
          <FifoHeaderCell
            key={`${column.key}-${index}`}
            column={column}
            tableState={tableState}
            optionsMap={optionsMap}
          />
        ))}
      </TableRow>
    </TableHeader>
  );
}
