import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGarageStore } from "../store/garageStore";
import { GarageCustomerDetailDrawer } from "../components/organisms/garage-customer-detail-drawer";
import { GarageDebtsDashboardTab } from "../components/GarageDebtsDashboardTab";
import { GarageDebtsExportDrawer } from "../components/organisms/garage-debts-export-drawer";
import { GarageDebtsTable } from "../components/organisms/garage-debts-table";
import type { TabItem } from "@/shared/components/PageLayout";

export function GarageDebts() {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const { selectedBranchId } = useGarageStore();

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    code: string;
    name: string;
  } | null>(null);

  const pageTabs: TabItem[] = useMemo(
    () => [
      {
        value: "overview",
        label: t("debts:tabs.overview", "Tổng quan"),
      },
      {
        value: "customers",
        label: t("partners.tabCustomers", "Khách hàng"),
      },
    ],
    [t],
  );

  return (
    <>
      {activeTab === "overview" ? (
        <GarageDebtsDashboardTab
          tabs={pageTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onExportClick={() => setExportDrawerOpen(true)}
          onOpenCustomerDetail={(code, name) =>
            setSelectedCustomer({
              code,
              name: name || "",
            })
          }
        />
      ) : (
        <GarageDebtsTable
          tabs={pageTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCustomerDetail={(customer) => setSelectedCustomer(customer)}
          onOpenExportDrawer={() => setExportDrawerOpen(true)}
        />
      )}

      {/* Customer Detail Drawer */}
      <GarageCustomerDetailDrawer
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        customerCode={selectedCustomer?.code || null}
        customerName={selectedCustomer?.name}
        branchId={selectedBranchId || undefined}
      />

      {/* Export Drawer */}
      <GarageDebtsExportDrawer
        open={exportDrawerOpen}
        onClose={() => setExportDrawerOpen(false)}
        branchId={selectedBranchId || undefined}
      />
    </>
  );
}

export default GarageDebts;
