import React, { useState, useCallback } from "react";
import { useGarageStore } from "../store/garageStore";
import { GarageCustomerDetailDrawer } from "../components/organisms/garage-customer-detail-drawer";
import { GarageDebtsDashboardTab } from "../components/GarageDebtsDashboardTab";
import { GarageDebtsExportDrawer } from "../components/organisms/garage-debts-export-drawer";
import { GarageDebtsTable } from "../components/organisms/garage-debts-table";
import { GaragePayablesTable } from "../components/organisms/garage-payables-table";
import { GarageSupplierDetailDrawer } from "../components/organisms/garage-supplier-detail-drawer";
import { GarageCashflowDrawer } from "../components/organisms/garage-cashflow-drawer/GarageCashflowDrawer";
import { useGarageDebtsTabs } from "../hooks/useGarageDebtsTabs";
import { useGarageDebtsCashflow } from "../hooks/useGarageDebtsCashflow";
import type { GarageDebtsExportContext } from "../export/garageDebtsExportContext";

export interface GarageDebtsProps {
  initialTab?: string;
}

export function GarageDebts({
  initialTab = "overview",
}: GarageDebtsProps = {}) {
  const { selectedBranchId } = useGarageStore();

  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [exportContext, setExportContext] = useState<
    GarageDebtsExportContext | undefined
  >(undefined);

  const [selectedCustomer, setSelectedCustomer] = useState<{
    code: string;
    name: string;
    licensePlate?: string;
    debtType?: "receivables" | "payables";
  } | null>(null);

  const [selectedSupplier, setSelectedSupplier] = useState<{
    id: string;
    code: string;
    name: string;
  } | null>(null);

  const { activeTab, handleTabChange, pageTabs } =
    useGarageDebtsTabs(initialTab);
  const {
    cashflowDrawerState,
    handleOpenCreateCashflow,
    handleCloseCashflowDrawer,
    handleCashflowSuccess,
  } = useGarageDebtsCashflow();

  const openExportDrawer = useCallback((context?: GarageDebtsExportContext) => {
    setExportContext(context ?? { kind: "all" });
    setExportDrawerOpen(true);
  }, []);

  return (
    <>
      {activeTab === "overview" && (
        <GarageDebtsDashboardTab
          tabs={pageTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onExportClick={() => openExportDrawer()}
          onOpenCustomerDetail={(code, name, licensePlate) =>
            setSelectedCustomer({
              code,
              name: name || "",
              licensePlate,
              debtType: "receivables",
            })
          }
        />
      )}

      {activeTab === "payables" && (
        <GaragePayablesTable
          tabs={pageTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenCustomerDetail={(cust) =>
            setSelectedCustomer({ ...cust, debtType: "payables" })
          }
          onOpenSupplierDetail={setSelectedSupplier}
          onOpenExportDrawer={openExportDrawer}
          onCreateCashflow={handleOpenCreateCashflow}
        />
      )}

      {(activeTab === "receivables" || activeTab === "customers") && (
        <GarageDebtsTable
          tabs={pageTabs}
          activeTab={activeTab === "customers" ? "receivables" : activeTab}
          onTabChange={handleTabChange}
          onOpenCustomerDetail={(cust) =>
            setSelectedCustomer({ ...cust, debtType: "receivables" })
          }
          onOpenExportDrawer={openExportDrawer}
          onCreateCashflow={handleOpenCreateCashflow}
        />
      )}

      <GarageCustomerDetailDrawer
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        customerCode={selectedCustomer?.code || null}
        customerName={selectedCustomer?.name}
        licensePlate={selectedCustomer?.licensePlate}
        branchId={selectedBranchId || undefined}
        debtType={
          selectedCustomer?.debtType ||
          (activeTab === "payables" ? "payables" : "receivables")
        }
        onDebtTypeChange={(newDebtType) => {
          setSelectedCustomer((prev) =>
            prev ? { ...prev, debtType: newDebtType } : null,
          );
        }}
        onCreateCashflow={handleOpenCreateCashflow}
      />

      <GarageSupplierDetailDrawer
        open={Boolean(selectedSupplier)}
        onClose={() => setSelectedSupplier(null)}
        supplierId={selectedSupplier?.id || null}
        supplierCode={selectedSupplier?.code}
        supplierName={selectedSupplier?.name}
        branchId={selectedBranchId || undefined}
      />

      <GarageDebtsExportDrawer
        open={exportDrawerOpen}
        onClose={() => setExportDrawerOpen(false)}
        branchId={selectedBranchId || undefined}
        context={exportContext}
      />

      <GarageCashflowDrawer
        open={cashflowDrawerState.open}
        onClose={handleCloseCashflowDrawer}
        voucher={null}
        initialMode="create"
        initialData={cashflowDrawerState.initialData}
        onSuccess={handleCashflowSuccess}
      />
    </>
  );
}

export default GarageDebts;
