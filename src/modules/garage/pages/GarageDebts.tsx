import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useGarageStore } from "../store/garageStore";
import { GarageCustomerDetailDrawer } from "../components/organisms/garage-customer-detail-drawer";
import { GarageDebtsDashboardTab } from "../components/GarageDebtsDashboardTab";
import { GarageDebtsExportDrawer } from "../components/organisms/garage-debts-export-drawer";
import { GarageDebtsTable } from "../components/organisms/garage-debts-table";
import { GaragePayablesTable } from "../components/organisms/garage-payables-table";
import { GarageSupplierDetailDrawer } from "../components/organisms/garage-supplier-detail-drawer";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import type { TabItem } from "@/shared/components/PageLayout";

export interface GarageDebtsProps {
  initialTab?: string;
}

export function GarageDebts({
  initialTab = "overview",
}: GarageDebtsProps = {}) {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const { selectedBranchId } = useGarageStore();

  const getValidTab = useCallback((tab: string | null) => {
    if (
      ["receivables", "payables", "overview", "customers"].includes(tab || "")
    )
      return tab as string;
    return "overview";
  }, []);

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const tabParam = new URLSearchParams(window.location.search).get(
        ErpUrlQueryParam.TAB,
      );
      if (tabParam) return getValidTab(tabParam);
    }
    return getValidTab(initialTab);
  });

  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    code: string;
    name: string;
    debtType?: "receivables" | "payables";
  } | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<{
    id: string;
    code: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const tabParam = new URLSearchParams(window.location.search).get(
        ErpUrlQueryParam.TAB,
      );
      setActiveTab(getValidTab(tabParam || initialTab));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [getValidTab, initialTab]);

  const handleTabChange = useCallback((nextTab: string) => {
    setActiveTab(nextTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const newParams = new URLSearchParams(url.search);
      newParams.set(ErpUrlQueryParam.TAB, nextTab);
      window.history.replaceState(
        null,
        "",
        `${url.pathname}?${newParams.toString()}`,
      );
    }
  }, []);

  const pageTabs: TabItem[] = useMemo(() => {
    return [
      { value: "overview", label: t("debts:tabs.overview", "Tổng quan") },
      { value: "receivables", label: t("partners.tabReceivables", "Phải thu") },
      { value: "payables", label: t("partners.tabPayables", "Phải trả") },
    ];
  }, [t]);

  return (
    <>
      {activeTab === "overview" && (
        <GarageDebtsDashboardTab
          tabs={pageTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onExportClick={() => setExportDrawerOpen(true)}
          onOpenCustomerDetail={(code, name) =>
            setSelectedCustomer({
              code,
              name: name || "",
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
          onOpenExportDrawer={() => setExportDrawerOpen(true)}
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
          onOpenExportDrawer={() => setExportDrawerOpen(true)}
        />
      )}

      <GarageCustomerDetailDrawer
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        customerCode={selectedCustomer?.code || null}
        customerName={selectedCustomer?.name}
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
      />
    </>
  );
}

export default GarageDebts;
