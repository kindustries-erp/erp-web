import { useEffect } from "react";
import { ArWorkbenchPanel } from "@/modules/finance/components/ArWorkbenchPanel";
import { useAppStore } from "@/core/config/appStore";

export function PhaiTra() {
  const { setCustomBreadcrumbs } = useAppStore();

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["breadcrumb.debt"],
      ["breadcrumb.debtPayable"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  return <ArWorkbenchPanel defaultTab="phai-tra" />;
}
