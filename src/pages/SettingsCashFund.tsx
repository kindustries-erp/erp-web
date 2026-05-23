import { useEffect } from "react";
import { Wallet } from "lucide-react";
import { QuyTab } from "@/modules/settings/components/CashFundTab";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { PageHeader } from "@/shared/components/PageHeader";

export function ThietLapQuy() {
  const { setCustomBreadcrumbs } = useAppStore();
  const t = useT();

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.catalog"],
      ["thietlap.tabs.quy"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("thietlap.tabs.quy")}
        desc={t("thietlap.desc")}
        icon={<Wallet className="h-4 w-4" />}
      />
      <QuyTab />
    </div>
  );
}
