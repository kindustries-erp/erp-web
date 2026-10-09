import { flexRender } from "@tanstack/react-table";
import type { Header, Table } from "@tanstack/react-table";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2ColumnHeaderFilter } from "@/v2/shared/components/molecules/v2-column-header-filter";
import { TableHead, TableHeader, TableRow } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import type { V2HeaderFilters } from "./V2StandardTable.filter.hook";
import type { V2TableState } from "./V2StandardTable.state.hook";
import type { V2Column } from "./V2StandardTable.type";

export const V2_ROW_ACTIONS_COLUMN_WIDTH = 116;

interface HeaderCellProps<T> {
  header: Header<T, unknown>;
  column?: V2Column<T>;
  state: V2TableState;
  hasOptionsSource: boolean;
  filters: V2HeaderFilters;
}

function V2TableHeaderCell<T>({
  header,
  column,
  state,
  hasOptionsSource,
  filters,
}: HeaderCellProps<T>) {
  const { query } = state;
  const key = header.column.id;
  const spec = column?.filter;

  const content =
    column && spec && hasOptionsSource ? (
      <V2ColumnHeaderFilter
        columnKey={key}
        label={column.label}
        valueType={spec.valueType}
        sort={state.getSort(key)}
        onSortChange={(direction) => state.setSort(key, direction)}
        selected={query.columnFilters[key] ?? []}
        onSelectedChange={(values) => state.setColumnFilter(key, values)}
        search={query.columnSearch[key] ?? ""}
        onSearchChange={(text) => state.setColumnSearch(key, text)}
        operator={query.columnOperators[key]}
        onOperatorChange={(filter) => state.setColumnOperator(key, filter)}
        dateRange={query.dateRanges[key]}
        onDateRangeChange={(range) => state.setDateRange(key, range)}
        onClear={() => state.clearColumn(key)}
        optionsState={filters.optionsFor(key)}
        onOpenChange={(open) =>
          filters.onOpenChange(key, open, query.columnSearch[key] ?? "")
        }
        onOptionsSearchChange={filters.onOptionsSearchChange}
        formatOptionLabel={spec.formatOptionLabel}
        align={column.align}
      />
    ) : (
      <V2Text
        as="span"
        variant="body-sm"
        weight="semibold"
        className="block truncate"
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
      </V2Text>
    );

  return (
    <TableHead
      data-column={key}
      style={{ width: header.getSize() }}
      className={cn(
        "sticky top-0 z-20 h-auto truncate border-r border-border bg-transparent px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-fg",
        column?.headerClassName,
      )}
    >
      {content}
      {header.column.getCanResize() && (
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none hover:bg-primary/40",
            header.column.getIsResizing() && "bg-primary",
          )}
        />
      )}
    </TableHead>
  );
}

interface HeaderRowsProps<T> {
  table: Table<T>;
  columnsByKey: Map<string, V2Column<T>>;
  state: V2TableState;
  fetchOptionsFor: (column: V2Column<T>) => unknown;
  filters: V2HeaderFilters;
}

export function V2TableHeaderRows<T>({
  table,
  columnsByKey,
  state,
  fetchOptionsFor,
  filters,
}: HeaderRowsProps<T>) {
  return (
    <TableHeader className="sticky top-0 z-20 border-b border-border bg-[var(--table-header-bg,rgba(244,246,248,0.65))] shadow-[0_1px_0_0_var(--border-light)] backdrop-blur-[16px] backdrop-saturate-200">
      {table.getHeaderGroups().map((group) => (
        <TableRow key={group.id} className="h-8 border-0 hover:bg-transparent">
          {group.headers.map((header) => {
            const column = columnsByKey.get(header.column.id);
            return (
              <V2TableHeaderCell
                key={header.id}
                header={header}
                column={column}
                state={state}
                hasOptionsSource={
                  column ? Boolean(fetchOptionsFor(column)) : false
                }
                filters={filters}
              />
            );
          })}
          <TableHead
            aria-hidden
            style={{ minWidth: V2_ROW_ACTIONS_COLUMN_WIDTH }}
            className="sticky top-0 z-20 h-auto border-r border-border bg-transparent p-0"
          />
        </TableRow>
      ))}
    </TableHeader>
  );
}
