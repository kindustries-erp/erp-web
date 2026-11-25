import { useAppStore } from "@/core/config/appStore";
import { GarageWorkshopProgressPage } from "@/v2/modules/cases-garage";

/**
 * Cầu nối shell → trang V2 tiến độ xưởng: truyền chi nhánh ERP đang chọn ở shell (header `x-erp-branch-id`);
 * chưa chọn thì trang hiện mọi chi nhánh. Trang V2 không import store của shell.
 */
export default function GarageWorkshopProgressRoute() {
  const currentBranchId = useAppStore((s) => s.currentBranchId);
  return <GarageWorkshopProgressPage branchId={currentBranchId || undefined} />;
}
