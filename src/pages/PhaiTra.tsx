import { useT } from "@/core/i18n";
import { PartnerLedgerPage } from "@/modules/finance/components/PartnerLedgerPage";

export function PhaiTra() {
  const t = useT();
  return (
    <PartnerLedgerPage
      itemType="PAYABLE"
      title={t("phaittra.title")}
      desc={t("phaittra.desc")}
    />
  );
}
