import React from "react";
import { PageLayout } from "@/shared/components/PageLayout";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { StandardTable } from "@/shared/components/StandardTable";
import { FilterPanel } from "@/shared/components/FilterPanel";
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
  bulkActionsNode,
  customActionsNode,
  filterConfig,
  filterState,
  filterPanelOpen,
  onFilterToggle,
  activeFilterCount = 0,
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
}: SpreadsheetPageTemplateProps<T>) {
  const t = useT();
  const finalEmptyLabel = emptyLabel ?? t("common.noData");
  const finalCreateLabel = createLabel ?? t("panel.createNew");

  return (
    <PageLayout
      title={title}
      desc={desc}
      icon={icon}
      actions={
        <TableActionGroup
          onRefresh={onRefresh}
          loading={loading}
          onFilterToggle={onFilterToggle}
          activeFilterCount={activeFilterCount}
          onCreate={onCreate}
          createLabel={finalCreateLabel}
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
      <div className="flex items-start flex-1 min-h-0">
        <div className="flex-1 min-w-0 space-y-4 flex flex-col h-full">
          <StandardTable
            tableId={tableId}
            defaultColumnOrder={["__actions", "__expand", "__selection"]}
            enableColumnVisibility={true}
            enableColumnResizing={true}
            variant="spreadsheet"
            items={items}
            columns={columns}
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
          />
        </div>
        {filterConfig && filterState && (
          <FilterPanel
            config={filterConfig}
            filter={{
              ...filterState,
              panelOpen: !!filterPanelOpen,
            }}
          />
        )}
      </div>
      {children}
    </PageLayout>
  );
}
