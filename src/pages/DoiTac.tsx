import { useState } from "react";
import { PartnersTab } from "@/modules/partners/components/PartnersTab";
import { ContactsTab } from "@/modules/partners/components/ContactsTab";
import { PartnerBankTab } from "@/modules/partners/components/PartnerBankTab";
import { PartnerRolesTab } from "@/modules/partners/components/PartnerRolesTab";
import { TabHeader } from "@/modules/partners/components/shared";
import type { ActiveTab } from "@/modules/partners/types";

export function DoiTac() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("partners");
  return (
    <div>
      <TabHeader active={activeTab} onChange={setActiveTab} />
      {activeTab === "partners" && <PartnersTab />}
      {activeTab === "contacts" && <ContactsTab />}
      {activeTab === "bankaccounts" && <PartnerBankTab />}
      {activeTab === "roles" && <PartnerRolesTab />}
    </div>
  );
}
