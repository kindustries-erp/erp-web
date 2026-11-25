import { useAppStore } from "@/core/config/appStore";
import { useKgaraBranchExternalId } from "@/modules/branches/api/useKgaraBranchExternalId";
import { GarageWorkshopProgressPage } from "@/v2/modules/cases-garage";

/**
 * Cầu nối shell → trang V2 tiến độ xưởng: đọc chi nhánh đang chọn ở shell, đổi sang external id KGara
 * (header `x-kgara-branch-id`) rồi truyền vào trang. Trang V2 không import store của shell.
 */
export default function GarageWorkshopProgressRoute() {
  const currentBranchId = useAppStore((s) => s.currentBranchId);
  const kgaraBranchId = useKgaraBranchExternalId(currentBranchId);
  return <GarageWorkshopProgressPage kgaraBranchId={kgaraBranchId} />;
}
