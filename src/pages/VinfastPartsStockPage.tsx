import React, { useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/core/config/appStore";
import type { TabItem } from "@/shared/components/PageLayout";
import { VinfastPartsDashboardPage } from "./VinfastPartsDashboardPage";
import { useVinfastPartsParallelPrefetch } from "./hooks/useVinfastPartsParallelPrefetch";
import { getDefaultVinfastPageSize } from "./hooks/useVinfastPartsStockStore";
import {
  useVinfastPartsStockPageUrl,
  type VinfastPartsStockTab,
} from "./hooks/useVinfastPartsStockPageUrl";
import { VinfastPartsStockTable } from "./components/vinfast-parts-stock-table";

export const getDefaultPageSize = getDefaultVinfastPageSize;
export type { VinfastPartsStockTab };

export interface VinfastPartsStockPageProps {
  initialTab?: VinfastPartsStockTab;
}

export function VinfastPartsStockPage({
  initialTab,
}: VinfastPartsStockPageProps) {
  const { t } = useTranslation(["vinfastParts", "nav", "common"]);
  const { setCustomBreadcrumbs } = useAppStore();

  const { activeTab, handleTabChange } =
    useVinfastPartsStockPageUrl(initialTab);

  const tabs = useMemo<TabItem[]>(
    () => [
      {
        value: "dashboard",
        label: t("nav:items.vinfastPartsDashboard", "Tổng quan"),
      },
      {
        value: "oto",
        label: t("nav:items.vinfastPartsOtoStock", "Phụ tùng ôtô"),
      },
      {
        value: "xemay",
        label: t("nav:items.vinfastPartsXemayStock", "Phụ tùng xe máy"),
      },
    ],
    [t],
  );

  // Breadcrumbs sync
  useEffect(() => {
    const tabBreadcrumbMap: Record<VinfastPartsStockTab, string> = {
      dashboard: "nav.items.vinfastPartsDashboard",
      oto: "nav.items.vinfastPartsOtoStock",
      xemay: "nav.items.vinfastPartsXemayStock",
    };
    setCustomBreadcrumbs([
      ["breadcrumb.vinfast"],
      ["nav.items.vinfastPartsGroup"],
      [tabBreadcrumbMap[activeTab] || "nav.items.vinfastPartsDashboard"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [activeTab, setCustomBreadcrumbs]);

  // 3-View Lazy Mounted Keep-Alive State
  const mountedViewsRef = useRef<Record<VinfastPartsStockTab, boolean>>({
    dashboard: activeTab === "dashboard",
    oto: activeTab === "oto",
    xemay: activeTab === "xemay",
  });

  if (activeTab) {
    mountedViewsRef.current[activeTab] = true;
  }

  // Micro-Priority Parallel Prefetch
  useVinfastPartsParallelPrefetch({
    activeTab,
  });

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden">
      {mountedViewsRef.current.dashboard && (
        <div
          className={
            activeTab === "dashboard"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <VinfastPartsDashboardPage
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      )}

      {mountedViewsRef.current.oto && (
        <div
          className={
            activeTab === "oto"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <VinfastPartsStockTable
            vehicleType="oto"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      )}

      {mountedViewsRef.current.xemay && (
        <div
          className={
            activeTab === "xemay"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <VinfastPartsStockTable
            vehicleType="xemay"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      )}
    </div>
  );
}

export const VinfastPartsStockTableView = VinfastPartsStockTable;
