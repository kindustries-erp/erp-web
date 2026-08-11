import { VinfastPartsStockTemplate } from "./components/VinfastPartsStockTemplate";
import { useT } from "@/core/i18n";

export function VinfastPartsOtoStockPage() {
  const t = useT();
  return (
    <VinfastPartsStockTemplate
      vehicleType="oto"
      title={t("nav.items.vinfastPartsOtoStock")}
      description={t("nav.items.vinfastPartsOtoStockDesc")}
    />
  );
}
