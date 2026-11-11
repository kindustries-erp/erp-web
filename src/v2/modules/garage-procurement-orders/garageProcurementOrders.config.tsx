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
    "/api/v2/procurement-orders-garage",
    {
      supportsDelete: true,
      supportsPurge: true,
      supportsClone: true,
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
    cloneable: true,
    // Khóa duyệt PO garage đang tắt: gửi duyệt = ghi nhận luôn, xử lý ở drawer
    directConfirmWhenApprovalOff: true,
    rowLabel: (row) => row.orderNo,
    requestApi: createProcurementApi<
      ProcurementRequestRow,
      ProcurementRequestDetail
    >("/api/v2/procurement-requests-garage", { supportsPoDraft: true }),
  };

/** Cột theo view: "overview" ẩn cột phụ, "all" hiện đủ cột. Giữ hằng số để không đổi identity. */
const ORDER_VIEW_VISIBILITY = {
  overview: {
    orderNo: true,
    supplierName: true,
    branchName: false,
    orderDate: true,
    totalAmount: true,
    status: true,
    fulfillmentStatus: true,
    paymentStatus: true,
    supplierInvoiceNo: false,
    createdBy: false,
  },
  all: {
    orderNo: true,
    supplierName: true,
    branchName: true,
    orderDate: true,
    totalAmount: true,
    status: true,
    fulfillmentStatus: true,
    paymentStatus: true,
    supplierInvoiceNo: true,
    createdBy: true,
  },
};

export const garageProcurementOrdersDisplay: ProcurementPageDisplay<ProcurementOrderRow> =
  {
    tableId: "procurement-orders-garage-table",
    viewVisibility: ORDER_VIEW_VISIBILITY,
    titleKey: "v2.garageProcurementOrders.title",
    descriptionKey: "v2.garageProcurementOrders.description",
    icon: <ShoppingCart className="h-4 w-4" />,
    buildColumns: buildProcurementOrderColumns,
    renderDrawer: (props) => (
      <ProcurementOrderDrawer
        {...props}
        branchOptional
        itemCodeRequired
        requestPickerCollection="garage_procurement_requests"
      />
    ),
  };
