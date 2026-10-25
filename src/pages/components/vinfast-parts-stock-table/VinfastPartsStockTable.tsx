import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { DownloadCloud, FileText } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { ComingSoon } from "@/pages/ComingSoon";
import { useVinfastPartsStockSummary } from "@/pages/hooks/useVinfastPartsStockSummary";
import { VinfastPartsStockDetailDrawer } from "../VinfastPartsStockDetailDrawer";
import { VinfastPartsSyncDrawer } from "../VinfastPartsSyncDrawer";
import { VinfastPartsStockExportDrawer } from "../VinfastPartsStockExportDrawer";
import type {
  VinfastPartsStockTableProps,
  VinfastPartsStockRow,
} from "./VinfastPartsStockTable.type";
import { useVinfastPartsStockTableLogic } from "./VinfastPartsStockTable.hook";
import { useVinfastPartsStockColumns } from "./VinfastPartsStockTable.columns";
import { useVinfastPartsStockActions } from "./VinfastPartsStockTable.actions";

export const VinfastPartsStockTable = React.memo(
  function VinfastPartsStockTable({
    vehicleType,
    tabs,
    activeTab,
    onTabChange,
  }: VinfastPartsStockTableProps) {
    const { t } = useTranslation(["vinfastParts", "nav", "common"]);
    const hasVinfastPerm = useHasPermission(
      ErpResource.VINFAST,
      ErpAction.READ,
    );
    const queryClient = useQueryClient();

    const logic = useVinfastPartsStockTableLogic(vehicleType, activeTab);

    const columnViewPresets = usePageViewPresets({
      tableId: `vinfast-parts-stock-${vehicleType}`,
      defaultPresets: [
        {
          key: "overview",
          label: t("vinfastParts:OVERVIEW_VIEW", "Tổng quan"),
          filters: {},
          columnVisibility: {},
        },
      ],
    });

    const handleSelectSku = useCallback(
      (sku: string, row: VinfastPartsStockRow) => {
        logic.setSelectedSku(vehicleType, sku, row);
      },
      [vehicleType, logic.setSelectedSku],
    );

    const columns = useVinfastPartsStockColumns({
      headerFilter: logic.headerFilter,
      t,
      vehicleType,
      onSelectSku: handleSelectSku,
    });

    const actions = useVinfastPartsStockActions({
      t,
      vehicleType,
      stockTab: logic.tabState.stockTab,
      setStockTab: logic.setStockTab,
      onSelectSku: handleSelectSku,
      onOpenSync: () => logic.setSyncDrawerOpen(true),
      onOpenExport: () => logic.setExportOpen(true),
      presets: columnViewPresets.presets,
      activePresetKey: columnViewPresets.activePreset?.key || "overview",
      onSelectPreset: (p) => columnViewPresets.selectView(p.key),
      onDeleteView: (k) => columnViewPresets.deleteView(k),
    });

    const summaryRow = useVinfastPartsStockSummary({
      items: logic.data?.items || logic.data?.data || [],
      summary: logic.data?.summary,
      page: logic.tabState.page,
      pageSize: logic.tabState.pageSize,
      totalCount: logic.data?.total || 0,
      totalPages: logic.data?.totalPages || 1,
    });

    if (!hasVinfastPerm) {
      return <ComingSoon />;
    }

    return (
      <>
        <SpreadsheetPageTemplate
          tableId={`vinfast-parts-stock-${vehicleType}`}
          title={t("nav:items.vinfastPartsStock", "Tồn kho phụ tùng")}
          desc={t(
            "nav:items.vinfastPartsStockDesc",
            "Sổ cái và tồn kho phụ tùng VinFast",
          )}
          icon={<FileText className="w-5 h-5 text-gray-500" />}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onRefresh={() =>
            queryClient.invalidateQueries({
              queryKey: ["vinfast-parts-stock", vehicleType],
            })
          }
          activeFilterCount={logic.tableState.activeFilterCount}
          onClearAllFilters={() => logic.tableState.resetFilters()}
          customActionsNode={actions.customActionsNode}
          onCreate={() => logic.setSyncDrawerOpen(true)}
          createLabel={t("vinfastParts:SYNC", "Đồng bộ")}
          createIcon={
            <DownloadCloud className="w-4 h-4 mr-1 text-primary-fg/80" />
          }
          createActions={actions.createActions}
          rowActions={actions.getRowActions}
          summaryRow={summaryRow}
          emptyLabel={t("common:noData", "Không có dữ liệu")}
          items={logic.data?.items || logic.data?.data || []}
          columns={columns}
          loading={logic.isLoading || logic.isFetching}
          page={logic.tabState.page}
          pageSize={logic.tabState.pageSize}
          total={logic.data?.total || 0}
          totalPages={logic.data?.totalPages || 0}
          onPage={(p) => logic.setPage(vehicleType, p)}
          onPageSize={(s) => logic.setPageSize(vehicleType, s)}
          getRowKey={(row: VinfastPartsStockRow) => row.sku}
        />

        <VinfastPartsStockDetailDrawer
          open={!!logic.tabState.selectedSku}
          onClose={() => logic.setSelectedSku(vehicleType, null)}
          sku={logic.tabState.selectedSku || ""}
          catalogData={logic.tabState.catalogData}
        />

        <VinfastPartsSyncDrawer
          open={logic.syncDrawerOpen}
          onClose={() => logic.setSyncDrawerOpen(false)}
        />

        <VinfastPartsStockExportDrawer
          open={logic.exportOpen}
          onClose={() => logic.setExportOpen(false)}
          buildBaseQuery={() => ({
            vehicleType,
            stockTab:
              logic.tabState.stockTab !== "ALL"
                ? logic.tabState.stockTab
                : undefined,
            search:
              logic.tableState.columnSearch["name"] ||
              logic.tableState.columnSearch["sku"] ||
              "",
            sortBy: logic.activeSort
              ? logic.activeSort.replace("-", "")
              : undefined,
            sortDir: logic.sortOrder as any,
            sorts: JSON.stringify(logic.tableState.sorts),
            columnSearch: JSON.stringify(logic.tableState.columnSearch),
            columnFilters: JSON.stringify(logic.tableState.columnFilters),
          })}
        />
      </>
    );
  },
);
