import {
  GarageWorkshopProgressPageBody,
  type GarageWorkshopProgressPageProps,
} from "./GarageWorkshopProgressPage.body";

/** Bố cục mobile cho nhân viên xưởng: tab status, danh sách thẻ một cột, chạm để cập nhật. */
export function GarageWorkshopProgressPageMobile(
  props: GarageWorkshopProgressPageProps,
) {
  return <GarageWorkshopProgressPageBody {...props} layout="mobile" />;
}
