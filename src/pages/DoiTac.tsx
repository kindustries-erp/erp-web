import { PartnersTab } from "@/modules/partners/components/PartnersTab";
import { ContactsTab } from "@/modules/partners/components/ContactsTab";
import { PartnerBankTab } from "@/modules/partners/components/PartnerBankTab";
import { PartnerRolesTab } from "@/modules/partners/components/PartnerRolesTab";
import { AppTabs } from "@/shared/components/AppTabs";

export function DoiTac() {
  const tabs = [
    { key: "partners", label: "Đối tác", content: <PartnersTab /> },
    { key: "contacts", label: "Liên hệ", content: <ContactsTab /> },
    { key: "bankaccounts", label: "Tài khoản NH", content: <PartnerBankTab /> },
    { key: "roles", label: "Vai trò", content: <PartnerRolesTab /> },
  ];

  return (
    <AppTabs 
      tabs={tabs} 
      variant="line" 
      defaultValue="partners"
    />
  );
}
