import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { PartnersTab } from "@/modules/partners/components/PartnersTab";
import { ContactsTab } from "@/modules/partners/components/ContactsTab";
import { PartnerBankTab } from "@/modules/partners/components/PartnerBankTab";
import { PartnerRolesTab } from "@/modules/partners/components/PartnerRolesTab";
import { PageWithTabsLayout } from "@/shared/components/PageWithTabsLayout";

export function DoiTac() {
  const [activeTab, setActiveTab] = useState("partners");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["partners", "contacts", "bankaccounts", "roles"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("partners");
      params.set("tab", "partners");
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
      title="Đối tác"
      desc="Quản lý danh sách đối tác, liên hệ, tài khoản ngân hàng và vai trò"
      icon={<Users className="h-4 w-4" />}
      tabs={[
        { value: "partners", label: "Đối tác" },
        { value: "contacts", label: "Liên hệ" },
        { value: "bankaccounts", label: "Tài khoản NH" },
        { value: "roles", label: "Vai trò" },
      ]}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className={activeTab === "partners" ? "" : "hidden"}>
        <PartnersTab />
      </div>
      <div className={activeTab === "contacts" ? "" : "hidden"}>
        <ContactsTab />
      </div>
      <div className={activeTab === "bankaccounts" ? "" : "hidden"}>
        <PartnerBankTab />
      </div>
      <div className={activeTab === "roles" ? "" : "hidden"}>
        <PartnerRolesTab />
      </div>
    </PageWithTabsLayout>
  );
}
