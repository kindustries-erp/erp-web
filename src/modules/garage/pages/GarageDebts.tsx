import React, { useState, useCallback, useRef } from "react";
import { useGarageStore } from "../store/garageStore";
import { GarageCustomerDetailDrawer } from "../components/organisms/garage-customer-detail-drawer";
import { GarageDebtsDashboardTab } from "../components/GarageDebtsDashboardTab";
import { GarageDebtsExportDrawer } from "../components/organisms/garage-debts-export-drawer";
import { GarageDebtsTable } from "../components/organisms/garage-debts-table";
import { GaragePayablesTable } from "../components/organisms/garage-payables-table";
import { GarageSupplierDetailDrawer } from "../components/organisms/garage-supplier-detail-drawer";
import { GarageCashflowDrawer } from "../components/organisms/garage-cashflow-drawer/GarageCashflowDrawer";
import {
  GarageDebtsTabKey,
  useGarageDebtsTabs,
} from "../hooks/useGarageDebtsTabs";
import { useGarageDebtsCashflow } from "../hooks/useGarageDebtsCashflow";
import type { GarageDebtsExportContext } from "../export/garageDebtsExportContext";

export interface GarageDebtsProps {
  initialTab?: GarageDebtsTabKey | string;
}

export function GarageDebts({
  initialTab = GarageDebtsTabKey.OVERVIEW,
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

  const normalizedTab: GarageDebtsTabKey =
    activeTab === GarageDebtsTabKey.CUSTOMERS
      ? GarageDebtsTabKey.RECEIVABLES
      : activeTab;

  const mountedViewsRef = useRef<Record<string, boolean>>({
    [GarageDebtsTabKey.OVERVIEW]: normalizedTab === GarageDebtsTabKey.OVERVIEW,
    [GarageDebtsTabKey.RECEIVABLES]:
      normalizedTab === GarageDebtsTabKey.RECEIVABLES,
    [GarageDebtsTabKey.PAYABLES]: normalizedTab === GarageDebtsTabKey.PAYABLES,
  });
  mountedViewsRef.current[normalizedTab] = true;

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden">
      {mountedViewsRef.current[GarageDebtsTabKey.OVERVIEW] && (
        <div
          className={
            normalizedTab === GarageDebtsTabKey.OVERVIEW
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <GarageDebtsDashboardTab
            tabs={pageTabs}
            activeTab={normalizedTab}
            onTabChange={handleTabChange}
            onExportClick={() => openExportDrawer()}
            onOpenCustomerDetail={(code, name, licensePlate) =>
              setSelectedCustomer({
                code,
                name: name || "",
                licensePlate,
                debtType: GarageDebtsTabKey.RECEIVABLES,
              })
            }
          />
        </div>
      )}

      {mountedViewsRef.current[GarageDebtsTabKey.PAYABLES] && (
        <div
          className={
            normalizedTab === GarageDebtsTabKey.PAYABLES
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <GaragePayablesTable
            tabs={pageTabs}
            activeTab={normalizedTab}
            onTabChange={handleTabChange}
            onOpenCustomerDetail={(cust) =>
              setSelectedCustomer({
                ...cust,
                debtType: GarageDebtsTabKey.PAYABLES,
              })
            }
            onOpenSupplierDetail={setSelectedSupplier}
            onOpenExportDrawer={openExportDrawer}
            onCreateCashflow={handleOpenCreateCashflow}
          />
        </div>
      )}

      {mountedViewsRef.current[GarageDebtsTabKey.RECEIVABLES] && (
        <div
          className={
            normalizedTab === GarageDebtsTabKey.RECEIVABLES
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <GarageDebtsTable
            tabs={pageTabs}
            activeTab={normalizedTab}
            onTabChange={handleTabChange}
            onOpenCustomerDetail={(cust) =>
              setSelectedCustomer({
                ...cust,
                debtType: GarageDebtsTabKey.RECEIVABLES,
              })
            }
            onOpenExportDrawer={openExportDrawer}
            onCreateCashflow={handleOpenCreateCashflow}
          />
        </div>
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
          (normalizedTab === GarageDebtsTabKey.PAYABLES
            ? GarageDebtsTabKey.PAYABLES
            : GarageDebtsTabKey.RECEIVABLES)
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
    </div>
  );
}

export default GarageDebts;
