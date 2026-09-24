import React, { useCallback } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { PillTabs } from "@/shared/components/PillTabs";
import { GarageCaseStandaloneDrawer } from "../GarageCaseStandaloneDrawer";
import { GarageCaseSyncDrawer } from "../GarageCaseSyncDrawer";
import { useGarageCaseServicesSectionLogic } from "./useGarageCaseServicesSectionLogic";
import type {
  GarageCaseServicesSectionProps,
  KgaraCaseServiceRow,
} from "./types";

export function GarageCaseServicesSection({
  tabs,
  activeTab,
  onTabChange,
}: GarageCaseServicesSectionProps) {
  const logic = useGarageCaseServicesSectionLogic();
  const { t, listHook } = logic;

  const getRowKey = useCallback(
    (row: KgaraCaseServiceRow) =>
      row.id ||
      row.hdPhieuDichVuChiTietId ||
      `${row.hdPhieuDichVuId}_${row.sanPhamCode || ""}`,
    [],
  );

  const serviceTypeTabsNode = (
    <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
      <PillTabs
        className="w-full sm:w-auto shrink-0"
        size="sm"
        items={[
          { value: "ALL", label: t("services.tabs.all", "Tất cả hạng mục") },
          { value: "DV", label: t("services.tabs.dv", "Công dịch vụ") },
          { value: "PT", label: t("services.tabs.pt", "Phụ tùng") },
        ]}
        value={listHook.serviceTypeFilter}
        onValueChange={(val) =>
          listHook.setServiceTypeFilter(val as "ALL" | "DV" | "PT")
        }
      />
    </div>
  );

  return (
    <>
      <SpreadsheetPageTemplate<KgaraCaseServiceRow>
        tableId="garage-case-services-table"
        title={t("services.title", "Chi tiết phiếu dịch vụ")}
        desc={t(
          "services.description",
          "Bảng kê chi tiết từng dòng công việc, công thợ và phụ tùng của các phiếu dịch vụ",
        )}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        items={listHook.items}
        getRowKey={getRowKey}
        columns={logic.columns}
        summaryRow={logic.summary}
        loading={listHook.isLoading}
        isPending={listHook.isFetching}
        onRefresh={listHook.refetch}
        createActions={logic.createActions}
        rowActions={logic.rowActions}
        customActionsNode={serviceTypeTabsNode}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.totalCount}
        totalPages={listHook.totalPages}
        onPage={listHook.setPage}
        onPageSize={(s) => {
          listHook.setPageSize(s);
          listHook.setPage(1);
        }}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
      />

      <GarageCaseStandaloneDrawer
        isOpen={!!logic.selectedCaseCode}
        caseCode={logic.selectedCaseCode}
        initialEditMode={logic.drawerEditMode}
        initialTabKey={logic.drawerInitialTab}
        onClose={logic.closeCaseDetail}
        onSuccess={logic.handleDrawerSuccess}
      />

      <GarageCaseSyncDrawer
        open={logic.syncDrawerOpen}
        mode={logic.syncMode}
        onClose={() => logic.setSyncDrawerOpen(false)}
        onSuccess={logic.handleDrawerSuccess}
      />
    </>
  );
}
