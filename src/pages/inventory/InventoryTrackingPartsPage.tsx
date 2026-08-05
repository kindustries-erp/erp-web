import { TrackedGoodsPage } from "@/modules/operational/components/list/TrackedGoodsPage";
import { useT } from "@/core/i18n";

export function InventoryTrackingPartsPage() {
  const t = useT();
  return (
    <TrackedGoodsPage
      fixedTrackingPolicy="SERIAL"
      title={t("inventoryTrackingParts.title", "Theo dõi Phụ tùng / Serial")}
      desc={t(
        "inventoryTrackingParts.desc",
        "Danh sách vật tư phụ tùng quản lý theo Serial",
      )}
    />
  );
}
