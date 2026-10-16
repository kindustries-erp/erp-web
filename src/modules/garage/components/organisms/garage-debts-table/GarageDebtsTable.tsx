import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useGarageStore } from "@/modules/garage/store/garageStore";
import { useGarageCustomersList } from "@/modules/garage/hooks/useGarageCustomersList";
import { Users, Eye, FileSpreadsheet } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type {
  GarageDebtsTableProps,
  CustomerDebtItem,
} from "./GarageDebtsTable.type";
import { useGarageDebtsColumns } from "./GarageDebtsTable.columns";
import { useGarageDebtsSummaryRow } from "./GarageDebtsTable.summary";
import { buildGarageDebtsExportContext } from "@/modules/garage/export/garageDebtsExportContext";

export const GarageDebtsTable: React.FC<GarageDebtsTableProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onOpenCustomerDetail,
  onOpenExportDrawer,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const { selectedBranchId } = useGarageStore();

  const listHook = useGarageCustomersList(selectedBranchId || undefined);

  const columns = useGarageDebtsColumns({
    listHook,
    selectedBranchId,
    t,
    onOpenCustomerDetail,
  });

  const summaryRow = useGarageDebtsSummaryRow({ listHook, t });

  const handleOpenExport = useCallback(() => {
    onOpenExportDrawer(buildGarageDebtsExportContext("customers", listHook));
  }, [listHook, onOpenExportDrawer]);

  const createActions = useMemo<ActionDropdownItem[]>(
    () => [
      {
        groupLabel: t("common:search", "Tra cứu"),
        items: [
          {
            label: t("debts.exportDetailed", "Xuất Excel theo kỳ / Nâng cao"),
            icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
            onClick: handleOpenExport,
          },
        ],
      },
    ],
    [handleOpenExport, t],
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
        `${row.licensePlate || "no_bks"}_${row.customerCode}_${row.branchExternalId || "all"}`
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
                  licensePlate: row.licensePlate,
                }),
            },
          ],
        },
      ]}
      summaryRow={summaryRow}
    />
  );
};
