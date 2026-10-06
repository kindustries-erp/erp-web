import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/core/config/appStore";
import { CashflowDashboard } from "@/pages/CashflowDashboard";
import { BankStatementSection } from "./BankStatementSection";

export interface BankStatementsTabProps {
  initialTab?: "dashboard" | "bank" | "cash";
  type?: "bank" | "cash";
  instanceIndex?: 1 | 2;
}

export function BankStatementsTab({
  initialTab: propInitialTab,
  type: propType,
  instanceIndex = 1,
}: BankStatementsTabProps) {
  const { t } = useTranslation();

  const getInitialTab = (): "dashboard" | "bank" | "cash" => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam === "dashboard" ||
        tabParam === "bank" ||
        tabParam === "cash"
      ) {
        return tabParam;
      }
    }
    return propType || propInitialTab || "dashboard";
  };

  const [currentTabKey, setCurrentTabKey] = useState<
    "dashboard" | "bank" | "cash"
  >(getInitialTab);
  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const pageTabs = useMemo(
    () => [
      {
        value: "dashboard",
        label: t("nav.items.cashflowDashboard", {
          defaultValue: "Tổng quan dòng tiền",
        }),
      },
      {
        value: "bank",
        label: t("bankStatement.bankTitle", {
          defaultValue: "Sao kê ngân hàng",
        }),
      },
      {
        value: "cash",
        label: t("bankStatement.cashTitle", {
          defaultValue: "Sổ quỹ tiền mặt",
        }),
      },
    ],
    [t],
  );

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
      ) as "dashboard" | "bank" | "cash";
      setCurrentTabKey(validTab);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", validTab);
        if (instanceIndex === 2) url.searchParams.set("_i", "2");
        const newUrl = url.toString();
        window.history.replaceState(null, "", newUrl);

        const currentInstanceId =
          instanceIndex === 2 ? "bank-statement__2" : "bank-statement";
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
        const currentInstanceId =
          instanceIndex === 2 ? "bank-statement__2" : "bank-statement";
        useAppStore
          .getState()
          .updateCurrentTabUrl?.(currentInstanceId, fullUrl);
      }
    }

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam === "dashboard" ||
        tabParam === "bank" ||
        tabParam === "cash"
      ) {
        setCurrentTabKey(tabParam);
      }
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
