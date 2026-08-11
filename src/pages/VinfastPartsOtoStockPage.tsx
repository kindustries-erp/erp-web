import { VinfastPartsStockTemplate } from "./components/VinfastPartsStockTemplate";
import { useTranslation } from "react-i18next";

export function VinfastPartsOtoStockPage() {
  const { t } = useTranslation();
  return (
    <VinfastPartsStockTemplate
      vehicleType="oto"
      title={t("Tồn kho phụ tùng VinFast - Ô tô", "VinFast Parts Stock - Car")}
    />
  );
}
