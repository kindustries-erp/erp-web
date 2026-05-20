import { useEffect } from "react";
import { NHTab } from "@/modules/settings/components/BankAccountTab";
import { useAppStore } from "@/core/config/appStore";

export function ThietLapNganHang() {
  const { setCustomBreadcrumbs } = useAppStore();

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.catalog"],
      ["thietlap.tabs.ngan-hang"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  return (
    <div className="p-4 md:p-6">
      <NHTab />
    </div>
  );
}
