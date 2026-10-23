import type { ReactNode } from "react";
// plop:v2-page-imports
import { BusinessPartnersPage } from "@/v2/modules/business-partners";

/**
 * Trang theo `id` của route. Route chưa có trang thì không có entry (hiện placeholder).
 * Generator `v2-module` chèn import và entry ngay trước các marker bên dưới.
 */
export const V2_PAGE_REGISTRY: Record<string, () => ReactNode> = {
  // plop:v2-pages
  customers: () => <BusinessPartnersPage partnerType="CUSTOMER" />,
  suppliers: () => <BusinessPartnersPage partnerType="VENDOR" />,
};
