import type { ReactNode } from "react";
import { V2AdminRouteId } from "@/v2/shared/types";
import { GarageGoodsReceiptsPage } from "@/v2/modules/garage-goods-receipts"; // v2-module:garage-goods-receipts:imports
import { GarageProcurementRequestsPage } from "@/v2/modules/garage-procurement-requests";
import { InvoiceShapePage } from "@/v2/modules/finance-invoice";
import { BusinessPartnersCustomersPage } from "@/v2/modules/business-partners-customers"; // v2-module:business-partners-customers:imports
import { BusinessPartnersSuppliersPage } from "@/v2/modules/business-partners-suppliers"; // v2-module:business-partners-suppliers:imports
import { RolesPage } from "@/v2/modules/rbac-roles"; // v2-module:rbac-roles:imports
import { LoansListPage } from "@/v2/modules/loans";
// plop:v2-page-imports
import { V2AdminDashboardPage } from "@/v2/modules/admin-dashboard";

/**
 * Trang theo `id` của route. Route chưa có trang thì không có entry (hiện placeholder).
 * Generator `v2-module` chèn import và entry ngay trước các marker bên dưới.
 */
export const V2_PAGE_REGISTRY: Record<string, () => ReactNode> = {
  "garage-goods-receipts": () => <GarageGoodsReceiptsPage />,
  "garage-procurement": () => (
    <GarageProcurementRequestsPage defaultTab="requests" />
  ),
  // v2-module:garage-goods-receipts:pages
  customers: () => <BusinessPartnersCustomersPage />,
  // v2-module:business-partners-customers:pages
  suppliers: () => <BusinessPartnersSuppliersPage />,
  // v2-module:business-partners-suppliers:pages
  permission: () => <RolesPage />,
  "permission-v2": () => <RolesPage />,
  "erp-permissions-core": () => <RolesPage />,
  "erp-permissions-core-v2": () => <RolesPage />,
  // v2-module:rbac-roles:pages
  // plop:v2-pages
  loans: () => <LoansListPage />,
  [V2AdminRouteId.DASHBOARD]: () => <V2AdminDashboardPage />,
  invoices: () => <InvoiceShapePage />,
};
