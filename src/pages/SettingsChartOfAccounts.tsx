import { useEffect } from "react";
import { BookOpen } from "lucide-react";
import { TKTab } from "@/modules/settings/components/ChartOfAccountsTab";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { PageHeader } from "@/shared/components/PageHeader";

export function ThietLapTaiKhoan() {
  const { setCustomBreadcrumbs } = useAppStore();
  const t = useT();

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.catalog"],
      ["thietlap.tabs.tai-khoan"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("thietlap.tabs.tai-khoan")}
        desc={t("thietlap.desc")}
        icon={<BookOpen className="h-4 w-4" />}
      />
      <TKTab />
    </div>
  );
}
