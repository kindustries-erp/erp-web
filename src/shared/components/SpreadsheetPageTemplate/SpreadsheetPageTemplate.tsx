import React from "react";
import { PageLayout } from "@/shared/components/PageLayout";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { StandardTable } from "@/shared/components/StandardTable";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { SearchInput } from "@/shared/components/SearchInput";
import { useT } from "@/core/i18n";
import type { SpreadsheetPageTemplateProps } from "./types";

export function SpreadsheetPageTemplate<T>({
  title,
  desc,
  icon,
  tableId,
  items,
  columns,
  getRowKey,
  loading,
  error,
  emptyLabel,
  minWidth = 1300,
  page,
  pageSize,
  total,
  totalPages,
  onPage,
  onPageSize,
  onRefresh,
  onCreate,
  createLabel,
  createActions,
  extraActions,
  bulkActionsNode,
  customActionsNode,
  filterConfig,
  filter,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  expandedRowKeys,
  renderSubRow,
  sortArray,
  onSort,
  rowActions,
  summaryRow,
  children,
  onRowClick,
  loadingRows,
}: SpreadsheetPageTemplateProps<T>) {
  const t = useT();
  const finalEmptyLabel = emptyLabel ?? t("common.noData");
  const finalCreateLabel = createLabel ?? t("panel.createNew");

  const processedColumns = React.useMemo(() => {
    return columns.map((col) => {
      let alignClass = "align-middle text-left";
      const keyStr = String(col.key || "").toLowerCase();
      const sortKeyStr = String(col.sortKey || "").toLowerCase();
      const combined = `${keyStr} ${sortKeyStr}`;

      if (
        combined.includes("date") ||
        combined.includes("qty") ||
        combined.includes("amount") ||
        combined.includes("price") ||
        combined.includes("total") ||
        combined.includes("tax") ||
        combined.includes("discount") ||
        combined.includes("rate")
      ) {
        alignClass = "align-middle text-right";
      } else if (
        combined.includes("status") ||
        combined.includes("badge") ||
        combined.includes("state")
      ) {
        alignClass = "align-middle text-center";
      }

      return {
        ...col,
        headerClassName: col.headerClassName ?? "text-center",
        className: col.className ?? alignClass,
      };
    });
  }, [columns]);

  const searchConfig = filterConfig?.search;
  const searchPlaceholder =
    typeof searchConfig === "object"
      ? searchConfig.placeholder
      : t("Tìm kiếm...");

  const searchNode =
    searchConfig && filter ? (
      <SearchInput
        value={filter.inputs.search}
        onChange={filter.setSearchInput}
        placeholder={searchPlaceholder}
        className="w-[150px] max-w-full"
      />
    ) : null;

  return (
    <PageLayout
      title={title}
      desc={desc}
      icon={icon}
      actions={
        <TableActionGroup
          onRefresh={onRefresh}
          loading={loading}
          onFilterToggle={filter?.togglePanel}
          activeFilterCount={filter?.activeFilterCount || 0}
          onCreate={onCreate}
          createLabel={finalCreateLabel}
          createActions={createActions}
          extraActions={
            <div className="flex items-center gap-2">
              {searchNode}
              {extraActions}
            </div>
          }
          portalId={tableId}
        >
          {bulkActionsNode}
          {customActionsNode}
        </TableActionGroup>
      }
    >
      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div className="flex items-stretch flex-1 min-h-0">
        <div className="flex-1 min-w-0 space-y-4 flex flex-col h-full">
          <StandardTable
            tableId={tableId}
            defaultColumnOrder={["__actions", "__expand", "__selection"]}
            enableColumnVisibility={true}
            enableColumnResizing={true}
            variant="spreadsheet"
            items={items}
            columns={processedColumns}
            getRowKey={getRowKey}
            loading={loading}
            emptyLabel={finalEmptyLabel}
            minWidth={minWidth}
            enableRowSelection={enableRowSelection}
            rowSelection={rowSelection}
            onRowSelectionChange={onRowSelectionChange}
            expandedRowKeys={expandedRowKeys}
            renderSubRow={renderSubRow}
            sortArray={sortArray}
            onSort={onSort}
            actions={rowActions}
            summaryRow={summaryRow}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={onPage}
            onPageSize={onPageSize}
            onRowClick={onRowClick}
            loadingRows={loadingRows}
            sidePanel={
              filterConfig && filter ? (
                <FilterPanel config={filterConfig} filter={filter} />
              ) : undefined
            }
          />
        </div>
      </div>
      {children}
    </PageLayout>
  );
}
