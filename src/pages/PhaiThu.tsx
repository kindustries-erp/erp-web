import { useT } from "@/core/i18n";
import { PartnerLedgerPage } from "@/modules/finance/components/PartnerLedgerPage";

export function PhaiThu() {
  const t = useT();
  return (
    <PartnerLedgerPage
      itemType="RECEIVABLE"
      title={t("phaithu.title")}
      desc={t("phaithu.desc")}
    />
  );
}
