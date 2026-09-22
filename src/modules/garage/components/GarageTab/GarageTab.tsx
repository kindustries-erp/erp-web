import React, { useRef } from "react";
import { useGarageTabLogic, type GarageTabProps } from "./useGarageTabLogic";
import { GarageDashboard } from "@/modules/garage/pages/GarageDashboard";
import { GarageCases } from "@/modules/garage/pages/GarageCases";

export type { GarageTabProps };

export function GarageTab(props: GarageTabProps = {}) {
  const logic = useGarageTabLogic(props);

  // 2-View Lazy Mounted Keep-Alive State (Synchronous render-time marking to prevent blank-frame flicker)
  const mountedViewsRef = useRef<Record<string, boolean>>({
    dashboard: logic.currentTabKey === "dashboard",
    cases: logic.currentTabKey === "cases",
  });

  if (logic.currentTabKey) {
    mountedViewsRef.current[logic.currentTabKey] = true;
  }

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden">
      {/* ── View 0: Dashboard (Tổng quan Garage) ────────────────────────── */}
      {mountedViewsRef.current["dashboard"] && (
        <div
          className={
            logic.currentTabKey === "dashboard"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <GarageDashboard
            tabs={logic.pageTabs}
            activeTab={logic.currentTabKey}
            onTabChange={logic.handleTabChange}
          />
        </div>
      )}

      {/* ── View 1: Cases (Phiếu dịch vụ & Sổ báo giá) ────────────────── */}
      {mountedViewsRef.current["cases"] && (
        <div
          className={
            logic.currentTabKey === "cases"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <GarageCases
            tabs={logic.pageTabs}
            activeTab={logic.currentTabKey}
            onTabChange={logic.handleTabChange}
          />
        </div>
      )}
    </div>
  );
}
