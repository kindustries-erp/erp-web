import type { ReactNode } from "react";
import { V2AdminRouteId } from "@/v2/shared/types";
import { GarageGoodsReceiptsPage } from "@/v2/modules/garage-goods-receipts"; // v2-module:garage-goods-receipts:imports
import { GaragePurchaseOrdersPage } from "@/v2/modules/garage-purchase-orders";
import { InvoiceShapePage } from "@/v2/modules/finance-invoice";
// plop:v2-page-imports
import { BusinessPartnersPage } from "@/v2/modules/business-partners";
import { V2AdminDashboardPage } from "@/v2/modules/admin-dashboard";

/**
 * Trang theo `id` của route. Route chưa có trang thì không có entry (hiện placeholder).
 * Generator `v2-module` chèn import và entry ngay trước các marker bên dưới.
 */
export const V2_PAGE_REGISTRY: Record<string, () => ReactNode> = {
  "garage-goods-receipts": () => <GarageGoodsReceiptsPage />,
  "garage-purchase-orders": () => <GaragePurchaseOrdersPage />,
  // v2-module:garage-goods-receipts:pages
  // plop:v2-pages
  [V2AdminRouteId.DASHBOARD]: () => <V2AdminDashboardPage />,
  customers: () => <BusinessPartnersPage partnerType="CUSTOMER" />,
  suppliers: () => <BusinessPartnersPage partnerType="VENDOR" />,
  invoices: () => <InvoiceShapePage />,
};
