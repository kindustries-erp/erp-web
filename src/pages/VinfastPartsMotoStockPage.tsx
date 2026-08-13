import { VinfastPartsStockTemplate } from "./components/VinfastPartsStockTemplate";
import { useT } from "@/core/i18n";

export function VinfastPartsMotoStockPage() {
  const t = useT();
  return (
    <VinfastPartsStockTemplate
      vehicleType="xemay"
      title={t("nav.items.vinfastPartsXemayStock")}
      description={t("nav.items.vinfastPartsXemayStockDesc")}
    />
  );
}
