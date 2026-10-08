import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useGarageStore } from "@/modules/garage/store/garageStore";
import { useGarageSuppliersList } from "@/modules/garage/hooks/useGarageSuppliersList";
import { Truck, Eye, Download, FileSpreadsheet } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type {
  GaragePayablesTableProps,
  SupplierDebtItem,
} from "./GaragePayablesTable.type";
import { useGaragePayablesColumns } from "./GaragePayablesTable.columns";
import { useGaragePayablesSummaryRow } from "./GaragePayablesTable.summary";
import { exportGaragePayablesCsv } from "./GaragePayablesTable.export";

export const GaragePayablesTable: React.FC<GaragePayablesTableProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onOpenCustomerDetail,
  onOpenSupplierDetail,
  onOpenExportDrawer,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const { selectedBranchId } = useGarageStore();

  const listHook = useGarageSuppliersList(selectedBranchId || undefined);

  const columns = useGaragePayablesColumns({
    listHook,
    selectedBranchId,
    t,
    onOpenCustomerDetail,
    onOpenSupplierDetail,
  });

  const summaryRow = useGaragePayablesSummaryRow({ listHook, t });

  const handleQuickExport = useCallback(() => {
    exportGaragePayablesCsv(listHook.data, t);
  }, [listHook.data, t]);

  const handleOpenDetail = useCallback(
    (row: SupplierDebtItem) => {
      if (onOpenCustomerDetail) {
        onOpenCustomerDetail({
          code: row.customerCode,
          name: row.customerName,
        });
      } else if (onOpenSupplierDetail) {
        onOpenSupplierDetail({
          id: row.id,
          code: row.customerCode,
          name: row.customerName,
        });
      }
    },
    [onOpenCustomerDetail, onOpenSupplierDetail],
  );

  const createActions = useMemo<ActionDropdownItem[]>(
    () => [
      {
        groupLabel: t("common:search", "Tra cứu"),
        items: [
          {
            label: t(
              "partners.exportCurrentView",
              "Xuất nhanh dữ liệu hiện tại",
            ),
            icon: <Download className="w-4 h-4 text-primary" />,
            onClick: handleQuickExport,
          },
          {
            label: t("debts:exportDetailed", "Xuất báo cáo chi tiết..."),
            icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
            onClick: onOpenExportDrawer,
          },
        ],
      },
    ],
    [handleQuickExport, onOpenExportDrawer, t],
  );

  return (
    <SpreadsheetPageTemplate<SupplierDebtItem>
      title={t("payables.titleGrouped", "Công nợ phải trả theo khách hàng")}
      desc={t(
        "payables.descGrouped",
        "Theo dõi, đối soát và phân tích chi phí sổ báo giá theo từng khách hàng, phân tầng 4 mốc tuổi nợ phải chi (Dữ liệu ghi nhận từ tháng 07/2026)",
      )}
      icon={<Truck className="w-5 h-5 text-primary" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tableId="garage-payables-table"
      createActions={createActions}
      items={listHook.data}
      columns={columns}
      getRowKey={(row) => row.id || row.customerCode || row.soPhieu}
      loading={listHook.isLoading}
      emptyLabel={t("payables.empty", "Không có dữ liệu công nợ phải trả")}
      page={listHook.page}
      pageSize={listHook.pageSize}
      total={listHook.total}
      totalPages={listHook.totalPages}
      onPage={(p) => listHook.setPage(p)}
      onPageSize={(s) => {
        listHook.setPageSize(s);
        listHook.setPage(1);
      }}
      onRefresh={() => listHook.refetch()}
      activeFilterCount={listHook.activeFilterCount}
      onClearAllFilters={listHook.clearAllFilters}
      rowActions={(row: SupplierDebtItem) => [
        {
          groupLabel: t("common:search", "TRA CỨU"),
          items: [
            {
              label: t(
                "customers.actions.viewDetail",
                "Xem chi tiết khách hàng",
              ),
              icon: <Eye className="w-4 h-4" />,
              onClick: () => handleOpenDetail(row),
            },
          ],
        },
      ]}
      summaryRow={summaryRow}
    />
  );
};
