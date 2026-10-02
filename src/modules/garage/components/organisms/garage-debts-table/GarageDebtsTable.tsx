import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useGarageStore } from "@/modules/garage/store/garageStore";
import { useGarageCustomersList } from "@/modules/garage/hooks/useGarageCustomersList";
import { useGarageBranches } from "@/modules/garage/hooks/useGarage";
import { Users, Eye, Download, FileSpreadsheet } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type {
  GarageDebtsTableProps,
  CustomerDebtItem,
} from "./GarageDebtsTable.type";
import { useGarageDebtsColumns } from "./GarageDebtsTable.columns";
import { useGarageDebtsSummaryRow } from "./GarageDebtsTable.summary";
import { exportGarageDebtsCsv } from "./GarageDebtsTable.export";

export const GarageDebtsTable: React.FC<GarageDebtsTableProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onOpenCustomerDetail,
  onOpenExportDrawer,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const { selectedBranchId } = useGarageStore();
  const { data: branches } = useGarageBranches();

  const listHook = useGarageCustomersList(selectedBranchId || undefined);

  const columns = useGarageDebtsColumns({
    listHook,
    selectedBranchId,
    branches,
    t,
    onOpenCustomerDetail,
  });

  const summaryRow = useGarageDebtsSummaryRow({ listHook, t });

  const handleQuickExport = useCallback(() => {
    void exportGarageDebtsCsv(listHook.data, branches, t);
  }, [branches, listHook.data, t]);

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
    <SpreadsheetPageTemplate<CustomerDebtItem>
      title={t("partners.title", "Công nợ garage")}
      desc={t(
        "partners.desc",
        "Theo dõi, đối soát và phân tích tổng hợp công nợ phải thu, tuổi nợ và danh sách phiếu dịch vụ theo từng khách hàng Garage (Dữ liệu công nợ ghi nhận từ tháng 07/2026)",
      )}
      icon={<Users className="w-5 h-5 text-primary" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tableId="garage-debts-table"
      createActions={createActions}
      items={listHook.data}
      columns={columns}
      getRowKey={(row) =>
        `${row.customerCode}_${row.branchExternalId || "all"}`
      }
      loading={listHook.isLoading}
      emptyLabel={t("customers.empty", "Không có dữ liệu khách hàng")}
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
      rowActions={(row: CustomerDebtItem) => [
        {
          groupLabel: "TRA CỨU",
          items: [
            {
              label: t("customers.viewDetail", "Xem chi tiết công nợ"),
              icon: <Eye className="w-4 h-4" />,
              onClick: () =>
                onOpenCustomerDetail({
                  code: row.customerCode,
                  name: row.customerName,
                }),
            },
          ],
        },
      ]}
      summaryRow={summaryRow}
    />
  );
};
