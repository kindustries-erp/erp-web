import { Barcode } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import type { TrackedGoodsPageProps } from "./types";
import { useTrackedGoodsPageLogic } from "./useTrackedGoodsPageLogic";
import { TrackedGoodsDrawers } from "./components/TrackedGoodsDrawers";

export function TrackedGoodsPage(props: TrackedGoodsPageProps = {}) {
  const {
    fixedTrackingPolicy,
    title,
    desc,
    t,
    pageTabs,
    currentTab,
    handleTabChange,
    tableId,
    items,
    columns,
    rowActions,
    loading,
    isPending,
    error,
    tableState,
    sortField,
    getSortState,
    handleSortChange,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    resetAllFilters,
    query,
    drawerOpen,
    setDrawerOpen,
    selectedItem,
    drawerMode,
    previewSoNo,
    setPreviewSoNo,
    giDrawer,
  } = useTrackedGoodsPageLogic(props);

  return (
    <>
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}
      <SpreadsheetPageTemplate
        tabs={!fixedTrackingPolicy ? pageTabs : undefined}
        activeTab={!fixedTrackingPolicy ? currentTab : undefined}
        onTabChange={!fixedTrackingPolicy ? handleTabChange : undefined}
        title={
          title || t("nav.items.erpInventoryTrackingGroup", "Theo dõi hàng hoá")
        }
        desc={
          desc ||
          t(
            "inventoryTracking.desc",
            "Quản lý định danh và truy xuất nguồn gốc xe, linh kiện, lô hàng và mã tùy chỉnh",
          )
        }
        icon={<Barcode className="h-5 w-5" />}
        tableId={tableId}
        items={items}
        columns={columns}
        getRowKey={(row) => row.id}
        rowActions={rowActions}
        loading={loading}
        isPending={isPending}
        error={error}
        emptyLabel={t("common.noData", "Chưa có dữ liệu.")}
        minWidth={1200}
        sortArray={
          tableState.sorts.length > 0
            ? tableState.sorts
            : sortField
              ? [sortField]
              : []
        }
        onSort={(key) => {
          const currentState = getSortState(key);
          const nextState =
            currentState === "none"
              ? "asc"
              : currentState === "asc"
                ? "desc"
                : "none";
          handleSortChange(key, nextState);
        }}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onRefresh={() => query.refetch()}
        activeFilterCount={tableState.activeFilterCount || 0}
        onClearAllFilters={resetAllFilters}
      />
      <TrackedGoodsDrawers
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        selectedItem={selectedItem}
        drawerMode={drawerMode}
        previewSoNo={previewSoNo}
        setPreviewSoNo={setPreviewSoNo}
        giDrawer={giDrawer}
        onRefetch={() => query.refetch()}
      />
    </>
  );
}
