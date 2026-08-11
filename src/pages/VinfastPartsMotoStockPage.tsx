import { VinfastPartsStockTemplate } from "./components/VinfastPartsStockTemplate";
import { useTranslation } from "react-i18next";

export function VinfastPartsMotoStockPage() {
  const { t } = useTranslation();
  return (
    <VinfastPartsStockTemplate
      vehicleType="xemay"
      title={t(
        "Tồn kho phụ tùng VinFast - Xe máy",
        "VinFast Parts Stock - Motorbike",
      )}
    />
  );
}
