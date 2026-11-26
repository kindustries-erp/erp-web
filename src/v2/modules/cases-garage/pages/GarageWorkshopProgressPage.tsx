import { useViewport } from "@/v2/shared/hooks/useViewport";
import type { GarageWorkshopProgressPageProps } from "./GarageWorkshopProgressPage.body";
import { GarageWorkshopProgressPageDesktop } from "./GarageWorkshopProgressPage.desktop";
import { GarageWorkshopProgressPageMobile } from "./GarageWorkshopProgressPage.mobile";

export type { GarageWorkshopProgressPageProps };

/** Trang tiến độ xưởng (`/garage-workshop-progress`): chọn bố cục theo viewport. */
export function GarageWorkshopProgressPage(
  props: GarageWorkshopProgressPageProps,
) {
  const { isMobile } = useViewport();
  return isMobile ? (
    <GarageWorkshopProgressPageMobile {...props} />
  ) : (
    <GarageWorkshopProgressPageDesktop {...props} />
  );
}
