import { useViewport } from "@/v2/shared/hooks/useViewport";
import { CasesDashboardGaragePageDesktop } from "./CasesDashboardGaragePage.desktop";
import { CasesDashboardGaragePageMobile } from "./CasesDashboardGaragePage.mobile";

/** Trang dashboard garage V2: chọn bố cục theo viewport. */
export function CasesDashboardGaragePage() {
  const { isMobile } = useViewport();
  return isMobile ? (
    <CasesDashboardGaragePageMobile />
  ) : (
    <CasesDashboardGaragePageDesktop />
  );
}
