import { useEffect } from "react";
import { TKTab } from "@/modules/settings/components/ChartOfAccountsTab";
import { useAppStore } from "@/core/config/appStore";

export function ThietLapTaiKhoan() {
  const { setCustomBreadcrumbs } = useAppStore();

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.catalog"],
      ["thietlap.tabs.tai-khoan"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  return (
    <div className="p-4 md:p-6">
      <TKTab />
    </div>
  );
}
