import { useEffect } from "react";
import { QuyTab } from "@/modules/settings/components/CashFundTab";
import { useAppStore } from "@/core/config/appStore";

export function ThietLapQuy() {
  const { setCustomBreadcrumbs } = useAppStore();

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.catalog"],
      ["thietlap.tabs.quy"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  return (
    <div className="p-4 md:p-6">
      <QuyTab />
    </div>
  );
}
