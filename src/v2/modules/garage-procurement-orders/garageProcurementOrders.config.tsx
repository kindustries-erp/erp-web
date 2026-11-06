import { ShoppingCart } from "lucide-react";
import {
  availableProcurementActions,
  buildProcurementOrderColumns,
  createProcurementApi,
  PROCUREMENT_ORDER_FROM,
} from "@/v2/core/procurement";
import type {
  ProcurementListConfig,
  ProcurementOrderRow,
  ProcurementPageDisplay,
  ProcurementRequestDetail,
  ProcurementRequestRow,
} from "@/v2/core/procurement";
import { ProcurementOrderDrawer } from "@/v2/core/procurement";

/** Đơn mua hàng garage (lõi procurement-orders, API v2). */
export const garageProcurementOrdersApi =
  createProcurementApi<ProcurementOrderRow>(
    "/api/v2/garage-procurement-orders",
    {
      supportsDelete: true,
      supportsPurge: true,
    },
  );

export const garageProcurementOrdersConfig: ProcurementListConfig<ProcurementOrderRow> =
  {
    api: garageProcurementOrdersApi,
    queryKey: "v2-garage-procurement-orders",
    approvalConfigPath: "/api/v2/approval-config/garage-procurement-orders",
    permissionCollection: "garage_procurement_orders",
    availableActions: (row) =>
      availableProcurementActions(PROCUREMENT_ORDER_FROM, row.status),
    isEditable: (row) => row.status === "DRAFT",
    rowLabel: (row) => row.orderNo,
    requestApi: createProcurementApi<
      ProcurementRequestRow,
      ProcurementRequestDetail
    >("/api/v2/garage-procurement-requests", { supportsPoDraft: true }),
  };

export const garageProcurementOrdersDisplay: ProcurementPageDisplay<ProcurementOrderRow> =
  {
    tableId: "erp-garage-procurement-orders-table",
    titleKey: "v2.garageProcurementOrders.title",
    descriptionKey: "v2.garageProcurementOrders.description",
    icon: <ShoppingCart className="h-4 w-4" />,
    buildColumns: buildProcurementOrderColumns,
    renderDrawer: (props) => (
      <ProcurementOrderDrawer {...props} branchOptional />
    ),
  };
