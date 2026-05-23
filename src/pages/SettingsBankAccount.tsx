import { useEffect } from "react";
import { Landmark } from "lucide-react";
import { NHTab } from "@/modules/settings/components/BankAccountTab";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { PageHeader } from "@/shared/components/PageHeader";

export function ThietLapNganHang() {
  const { setCustomBreadcrumbs } = useAppStore();
  const t = useT();

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.catalog"],
      ["thietlap.tabs.ngan-hang"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("thietlap.tabs.ngan-hang")}
        desc={t("thietlap.desc")}
        icon={<Landmark className="h-4 w-4" />}
      />
      <NHTab />
    </div>
  );
}
