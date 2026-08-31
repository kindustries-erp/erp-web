import { TrackedGoodsPage } from "@/modules/operational/components/list/TrackedGoodsPage";
import { useT } from "@/core/i18n";

export function FinishedGoodsPage() {
  const t = useT();
  return (
    <TrackedGoodsPage
      fixedTrackingPolicy="VEHICLE"
      title={t("finishedGoods.title", "Thành phẩm")}
      desc={t(
        "finishedGoods.desc",
        "Quản lý danh sách thành phẩm xe, số VIN, số khung, số máy, trạng thái tồn kho và vòng đời serial",
      )}
    />
  );
}

export default FinishedGoodsPage;
