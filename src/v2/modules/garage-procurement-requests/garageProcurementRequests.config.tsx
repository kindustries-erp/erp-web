import { ClipboardList } from "lucide-react";
import {
  availableProcurementActions,
  buildProcurementRequestColumns,
  createProcurementApi,
  PROCUREMENT_REQUEST_FROM,
} from "@/v2/core/procurement";
import type {
  ProcurementListConfig,
  ProcurementPageDisplay,
  ProcurementRequestRow,
} from "@/v2/core/procurement";
import { ProcurementRequestDrawer } from "@/v2/core/procurement";

/** Đề nghị mua hàng garage (lõi procurement-requests, API v2). */
export const garageProcurementRequestsApi =
  createProcurementApi<ProcurementRequestRow>(
    "/api/v2/garage-procurement-requests",
    { supportsDelete: true, supportsPurge: true },
  );

export const garageProcurementRequestsConfig: ProcurementListConfig<ProcurementRequestRow> =
  {
    api: garageProcurementRequestsApi,
    queryKey: "v2-garage-procurement-requests",
    approvalConfigPath: "/api/v2/approval-config/garage-procurement-requests",
    permissionCollection: "garage_procurement_requests",
    availableActions: (row) =>
      availableProcurementActions(PROCUREMENT_REQUEST_FROM, row.status),
    isEditable: (row) => row.status === "DRAFT",
    rowLabel: (row) => row.requestNo,
    poHref: "/garage-procurement?tab=orders",
    canOrderFromRequest: (row) =>
      row.status === "APPROVED" && row.orderingStatus !== "FULL",
  };

/** Cột theo view: "overview" ẩn cột phụ, "all" hiện đủ cột. Giữ hằng số để không đổi identity. */
const REQUEST_VIEW_VISIBILITY = {
  overview: {
    requestNo: true,
    requestDate: true,
    title: true,
    branchName: false,
    estimatedTotal: true,
    status: true,
    orderingStatus: true,
    createdBy: false,
    approver: false,
  },
  all: {
    requestNo: true,
    requestDate: true,
    title: true,
    branchName: true,
    estimatedTotal: true,
    status: true,
    orderingStatus: true,
    createdBy: true,
    approver: true,
  },
};

export const garageProcurementRequestsDisplay: ProcurementPageDisplay<ProcurementRequestRow> =
  {
    tableId: "erp-garage-procurement-requests-table",
    viewVisibility: REQUEST_VIEW_VISIBILITY,
    titleKey: "v2.garageProcurementRequests.title",
    descriptionKey: "v2.garageProcurementRequests.description",
    icon: <ClipboardList className="h-4 w-4" />,
    buildColumns: buildProcurementRequestColumns,
    renderDrawer: (props) => (
      <ProcurementRequestDrawer {...props} branchOptional />
    ),
  };
