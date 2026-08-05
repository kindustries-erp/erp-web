import { TrackedGoodsPage } from "@/modules/operational/components/list/TrackedGoodsPage";
import { useT } from "@/core/i18n";

export function InventoryTrackingPage() {
  const t = useT();
  return (
    <TrackedGoodsPage
      fixedTrackingPolicy="VEHICLE"
      title={t("inventoryTrackingVehicle.title", "Theo dõi Xe")}
      desc={t(
        "inventoryTrackingVehicle.desc",
        "Danh sách xe quản lý theo số khung/số máy",
      )}
    />
  );
}
