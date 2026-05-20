import { useEffect } from "react";
import { GitBranch } from "lucide-react";
import { BranchTab } from "@/modules/settings/components/BranchTab";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { PageHeader } from "@/shared/components/PageHeader";

export function SettingsBranch() {
  const { setCustomBreadcrumbs } = useAppStore();
  const t = useT();
  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.catalog"],
      ["thietlap.tabs.chi-nhanh"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);
  return (
    <div className="p-4 md:p-6 space-y-4">
      <PageHeader
        title={t("thietlap.tabs.chi-nhanh")}
        desc={t("thietlap.desc")}
        icon={<GitBranch className="h-4 w-4" />}
      />
      <BranchTab />
    </div>
  );
}
