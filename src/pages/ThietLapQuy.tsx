import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { PageWithTabsLayout } from "@/shared/components/PageWithTabsLayout";
import { QuyTab } from "@/modules/settings/components/QuyTab";
import { NHTab } from "@/modules/settings/components/NHTab";
import { TKTab } from "@/modules/settings/components/TKTab";

export function ThietLapQuy() {
  const [activeTab, setActiveTab] = useState("quy");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["quy", "nh", "tk"].includes(tab)) {
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
      title="Thiết lập danh mục"
      desc="Quản lý danh mục quỹ, ngân hàng, tài khoản"
      icon={<Wallet className="h-4 w-4" />}
      tabs={[
        { value: "quy", label: "Danh mục Quỹ" },
        { value: "nh", label: "Danh mục Ngân hàng" },
        { value: "tk", label: "Danh mục Tài khoản" },
      ]}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className={activeTab === "quy" ? "" : "hidden"}>
        <QuyTab />
      </div>
      <div className={activeTab === "nh" ? "" : "hidden"}>
        <NHTab />
      </div>
      <div className={activeTab === "tk" ? "" : "hidden"}>
        <TKTab />
      </div>
    </PageWithTabsLayout>
  );
}
