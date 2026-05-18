import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { PageWithTabsLayout } from "@/shared/components/PageWithTabsLayout";
import { QuyTab } from "@/modules/settings/components/QuyTab";
import { NHTab } from "@/modules/settings/components/NHTab";
import { TKTab } from "@/modules/settings/components/TKTab";
import { BranchTab } from "@/modules/settings/components/BranchTab";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";

export function ThietLapQuy() {
  const t = useT();
  const [activeTab, setActiveTab] = useState("quy");
  const { setCustomBreadcrumbs } = useAppStore();

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.catalog"],
      [`thietlap.tabs.${activeTab}`],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [activeTab, setCustomBreadcrumbs]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["quy", "ngan-hang", "tai-khoan", "chi-nhanh"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("quy");
      params.set("tab", "quy");
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }, []);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", val);
    history.pushState(null, "", url.toString());
  };

  return (
    <PageWithTabsLayout
      className="space-y-4"
      title={t("thietlap.title")}
      desc={t("thietlap.desc")}
      icon={<Wallet className="h-4 w-4" />}
      tabs={[
        { value: "chi-nhanh", label: t("thietlap.tabs.chi-nhanh") },
        { value: "quy", label: t("thietlap.tabs.quy") },
        { value: "ngan-hang", label: t("thietlap.tabs.ngan-hang") },
        { value: "tai-khoan", label: t("thietlap.tabs.tai-khoan") },
      ]}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className={activeTab === "chi-nhanh" ? "" : "hidden"}>
        <BranchTab />
      </div>
      <div className={activeTab === "quy" ? "" : "hidden"}>
        <QuyTab />
      </div>
      <div className={activeTab === "ngan-hang" ? "" : "hidden"}>
        <NHTab />
      </div>
      <div className={activeTab === "tai-khoan" ? "" : "hidden"}>
        <TKTab />
      </div>
    </PageWithTabsLayout>
  );
}
