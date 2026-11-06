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
    permissionCollection: "garage_procurement_requests",
    availableActions: (row) =>
      availableProcurementActions(PROCUREMENT_REQUEST_FROM, row.status),
    isEditable: (row) => row.status === "DRAFT",
    rowLabel: (row) => row.requestNo,
    poHref: "/garage-procurement-orders",
    canOrderFromRequest: (row) =>
      row.status === "APPROVED" && row.orderingStatus !== "FULL",
  };

export const garageProcurementRequestsDisplay: ProcurementPageDisplay<ProcurementRequestRow> =
  {
    tableId: "erp-garage-procurement-requests-table",
    titleKey: "v2.garageProcurementRequests.title",
    descriptionKey: "v2.garageProcurementRequests.description",
    icon: <ClipboardList className="h-4 w-4" />,
    buildColumns: buildProcurementRequestColumns,
    renderDrawer: (props) => (
      <ProcurementRequestDrawer {...props} branchOptional />
    ),
  };
