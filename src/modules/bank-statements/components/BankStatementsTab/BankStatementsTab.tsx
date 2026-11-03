import React, { useState, useCallback, useRef, useEffect } from "react";
import { useAppStore } from "@/core/config/appStore";
import { CashflowDashboard } from "@/pages/CashflowDashboard";
import { BankStatementSection } from "./BankStatementSection";
import {
  readBankStatementTab,
  type BankStatementTab,
} from "./bankStatementTab.helper";
import {
  useBankStatementPageTabs,
  useBankStatementRoutedTab,
} from "./useBankStatementTabs";

export interface BankStatementsTabProps {
  initialTab?: BankStatementTab;
  type?: "bank" | "cash";
  instanceIndex?: 1 | 2;
}

export function BankStatementsTab({
  initialTab: propInitialTab,
  type: propType,
  instanceIndex = 1,
}: BankStatementsTabProps) {
  const getInitialTab = (): BankStatementTab => {
    if (typeof window !== "undefined") {
      const routedTab = readBankStatementTab(window.location.href);
      if (routedTab) return routedTab;
    }
    return propType || propInitialTab || "dashboard";
  };

  const [currentTabKey, setCurrentTabKey] =
    useState<BankStatementTab>(getInitialTab);
  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useBankStatementRoutedTab(setCurrentTabKey);
  const pageTabs = useBankStatementPageTabs();

  const mountedViewsRef = useRef<Record<string, boolean>>({
    dashboard: currentTabKey === "dashboard",
    bank: currentTabKey === "bank",
    cash: currentTabKey === "cash",
  });

  if (currentTabKey) {
    mountedViewsRef.current[currentTabKey] = true;
  }

  const handleTabChange = useCallback(
    (newTab: string) => {
      if (debounceUrlTimerRef.current)
        clearTimeout(debounceUrlTimerRef.current);
      const validTab = (
        newTab === "bank" || newTab === "cash" ? newTab : "dashboard"
      ) as BankStatementTab;
      setCurrentTabKey(validTab);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", validTab);
        if (instanceIndex === 2) url.searchParams.set("_i", "2");
        const newUrl = url.toString();
        window.history.replaceState(null, "", newUrl);

        // Id instance theo trang đang mở (cashflow, bank-statement, cash-statement...)
        const currentInstanceId = useAppStore.getState().currentInstanceId;
        debounceUrlTimerRef.current = setTimeout(() => {
          useAppStore
            .getState()
            .updateCurrentTabUrl?.(currentInstanceId, newUrl);
        }, 300);
      }
    },
    [instanceIndex],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (!url.searchParams.has("tab")) {
        url.searchParams.set("tab", currentTabKey);
        const fullUrl = url.toString();
        window.history.replaceState(null, "", fullUrl);
        const currentInstanceId = useAppStore.getState().currentInstanceId;
        useAppStore
          .getState()
          .updateCurrentTabUrl?.(currentInstanceId, fullUrl);
      }
    }

    const handlePopState = () => {
      const tab = readBankStatementTab(window.location.href);
      if (tab) setCurrentTabKey(tab);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (debounceUrlTimerRef.current)
        clearTimeout(debounceUrlTimerRef.current);
    };
  }, [instanceIndex, currentTabKey]);

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden">
      {mountedViewsRef.current["dashboard"] && (
        <div
          className={
            currentTabKey === "dashboard"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <CashflowDashboard
            tabs={pageTabs}
            activeTab={currentTabKey}
            onTabChange={handleTabChange}
          />
        </div>
      )}
      {mountedViewsRef.current["bank"] && (
        <div
          className={
            currentTabKey === "bank"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <BankStatementSection
            type="bank"
            tabs={pageTabs}
            activeTab={currentTabKey}
            onTabChange={handleTabChange}
            instanceIndex={instanceIndex}
          />
        </div>
      )}
      {mountedViewsRef.current["cash"] && (
        <div
          className={
            currentTabKey === "cash"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <BankStatementSection
            type="cash"
            tabs={pageTabs}
            activeTab={currentTabKey}
            onTabChange={handleTabChange}
            instanceIndex={instanceIndex}
          />
        </div>
      )}
    </div>
  );
}
