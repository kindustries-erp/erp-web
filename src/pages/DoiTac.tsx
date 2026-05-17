import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { PartnersTab } from "@/modules/partners/components/PartnersTab";
import { ContactsTab } from "@/modules/partners/components/ContactsTab";
import { PartnerBankTab } from "@/modules/partners/components/PartnerBankTab";
import { PartnerRolesTab } from "@/modules/partners/components/PartnerRolesTab";
import { PageWithTabsLayout } from "@/shared/components/PageWithTabsLayout";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";

export function DoiTac() {
  const t = useT();
  const [activeTab, setActiveTab] = useState("doi-tac");
  const { setCustomBreadcrumbs } = useAppStore();

  useEffect(() => {
    const tabKeyMap: Record<string, string> = {
      "doi-tac": "partners",
      "lien-he": "contacts",
      "tai-khoan-ngan-hang": "bankAccounts",
      "vai-tro": "roles",
    };
    const key = tabKeyMap[activeTab] || "partners";
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.partners"],
      [`doitac.tabs.${key}`],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [activeTab, setCustomBreadcrumbs]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["doi-tac", "lien-he", "tai-khoan-ngan-hang", "vai-tro"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("doi-tac");
      params.set("tab", "doi-tac");
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
      title={t("nav.items.partners")}
      desc={t("doitac.desc")}
      icon={<Users className="h-4 w-4" />}
      tabs={[
        { value: "doi-tac", label: t("doitac.tabs.partners") },
        { value: "lien-he", label: t("doitac.tabs.contacts") },
        { value: "tai-khoan-ngan-hang", label: t("doitac.tabs.bankAccounts") },
        { value: "vai-tro", label: t("doitac.tabs.roles") },
      ]}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className={activeTab === "doi-tac" ? "" : "hidden"}>
        <PartnersTab />
      </div>
      <div className={activeTab === "lien-he" ? "" : "hidden"}>
        <ContactsTab />
      </div>
      <div className={activeTab === "tai-khoan-ngan-hang" ? "" : "hidden"}>
        <PartnerBankTab />
      </div>
      <div className={activeTab === "vai-tro" ? "" : "hidden"}>
        <PartnerRolesTab />
      </div>
    </PageWithTabsLayout>
  );
}
