import React from "react";
import { PageLayout } from "@/shared/components/PageLayout";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { StandardTable } from "@/shared/components/StandardTable";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { SearchInput } from "@/shared/components/SearchInput";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useT } from "@/core/i18n";
import { useUnifiedTableFilter } from "@/shared/hooks/useUnifiedTableFilter";
import type { SpreadsheetPageTemplateProps } from "./types";

export function SpreadsheetPageTemplate<T>({
  title,
  desc,
  icon,
  tabs,
  activeTab,
  onTabChange,
  hideTabs,
  tableId,
  items,
  columns,
  defaultColumnOrder = ["__selection", "__expand"],
  defaultColumnVisibility,
  getRowKey,
  loading,
  isPending,
  error,
  emptyLabel,
  minWidth = 1300,
  actionColumnSize,
  page,
  pageSize,
  total,
  totalPages,
  onPage,
  onPageSize,
  onRefresh,
  onCreate,
  createLabel,
  createIcon,
  createActions,
  extraActions,
  bulkActionsNode,
  customActionsNode,
  filterConfig,
  filter,
  listHook,
  unifiedFilter: directUnifiedFilter,
  activeFilterCount,
  onClearAllFilters,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  expandedRowKeys,
  renderSubRow,
  sortArray,
  onSort,
  rowActions,
  enableRowHoverActions,
  hideLegacyActionColumn = true,
  summaryRow,
  children,
  onRowClick,
  getRowClassName,
  enableRowContextMenu,
  onRowContextMenu,
  loadingRows,
  topNode,
  hideHeader,
  enableFullscreen = true,
  onFullscreenChange,
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
        combined.includes("rate") ||
        combined.includes("cost") ||
        combined.includes("revenue") ||
        combined.includes("profit") ||
        combined.includes("margin") ||
        combined.includes("doanhthu") ||
        combined.includes("chiphi") ||
        combined.includes("loinhuan") ||
        combined.includes("balance") ||
        combined.includes("tienco") ||
        combined.includes("tiencon")
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

  const internalUnifiedFilter = useUnifiedTableFilter({
    columns: processedColumns,
    tableId,
    listHook,
    filterConfig,
    filter,
  });

  const unifiedFilter = directUnifiedFilter || internalUnifiedFilter;

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

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleFullscreenChange = React.useCallback(
    (isFs: boolean) => {
      setIsFullscreen(isFs);
      onFullscreenChange?.(isFs);
    },
    [onFullscreenChange],
  );

  const effectiveActiveFilterCount =
    activeFilterCount ??
    (unifiedFilter.activeFilterCount > 0
      ? unifiedFilter.activeFilterCount
      : (filter?.activeFilterCount ?? 0));

  const actionGroupNode = (
    <TableActionGroup
      onRefresh={onRefresh}
      loading={loading}
      onFilterToggle={unifiedFilter.togglePanel}
      activeFilterCount={effectiveActiveFilterCount}
      onClearAllFilters={onClearAllFilters ?? unifiedFilter.resetAll}
      onCreate={onCreate}
      createLabel={finalCreateLabel}
      createIcon={createIcon}
      createActions={createActions}
      extraActions={
        <div className="flex items-center gap-2">
          {searchNode}
          {extraActions}
        </div>
      }
      portalId={tableId}
    >
      {customActionsNode}
      {bulkActionsNode}
    </TableActionGroup>
  );

  const tabsNode =
    tabs && !hideTabs ? (
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full z-10 bg-transparent shrink-0"
      >
        <TabsList className="bg-transparent border-b border-[color:var(--border)]/60 w-full justify-start rounded-none h-auto p-0 gap-6 shadow-none overflow-x-auto scrollbar-none [&>[data-tabs-indicator]]:hidden">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="border-b-2 border-transparent rounded-none px-1 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary whitespace-nowrap flex-shrink-0 transition-colors"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    ) : undefined;

  return (
    <PageLayout
      title={title}
      desc={desc}
      icon={icon}
      hideHeader={hideHeader}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      hideTabs={hideTabs}
      actions={!isFullscreen ? actionGroupNode : undefined}
    >
      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div className="flex items-stretch flex-1 min-h-0">
        <div className="flex-1 min-w-0 space-y-4 flex flex-col h-full">
          {topNode}
          <StandardTable
            tableId={tableId}
            defaultColumnOrder={defaultColumnOrder}
            defaultColumnVisibility={defaultColumnVisibility}
            enableColumnVisibility={true}
            enableColumnResizing={true}
            variant="spreadsheet"
            items={items}
            columns={processedColumns}
            getRowKey={getRowKey}
            loading={loading}
            isPending={isPending}
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
            actionColumnSize={actionColumnSize}
            enableRowHoverActions={enableRowHoverActions}
            hideLegacyActionColumn={hideLegacyActionColumn}
            summaryRow={summaryRow}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={onPage}
            onPageSize={onPageSize}
            onRowClick={onRowClick}
            getRowClassName={getRowClassName}
            enableRowContextMenu={enableRowContextMenu}
            onRowContextMenu={onRowContextMenu}
            loadingRows={loadingRows}
            enableFullscreen={enableFullscreen}
            tableTitle={title}
            tableDesc={desc}
            tableIcon={icon}
            fullscreenHeaderExtra={actionGroupNode}
            fullscreenTabs={tabsNode}
            onFullscreenChange={handleFullscreenChange}
            sidePanel={
              <FilterPanel
                unifiedFilter={unifiedFilter}
                columns={processedColumns}
                tableId={tableId}
                listHook={listHook}
                config={filterConfig}
                filter={filter}
              />
            }
          />
        </div>
      </div>
      {children}
    </PageLayout>
  );
}
