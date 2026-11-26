import {
  GarageWorkshopProgressPageBody,
  type GarageWorkshopProgressPageProps,
} from "./GarageWorkshopProgressPage.body";

/** Bố cục desktop: board Kanban 5 cột status v2 chiếm toàn chiều cao. */
export function GarageWorkshopProgressPageDesktop(
  props: GarageWorkshopProgressPageProps,
) {
  return <GarageWorkshopProgressPageBody {...props} layout="desktop" />;
}
