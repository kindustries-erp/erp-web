import * as React from "react";
import { updateV2SearchParams } from "@/v2/shared/utils/v2Url";
import { useV2SearchParams } from "@/v2/shared/hooks/useV2SearchParams";
import {
  getOrderStatusOptions,
  getRequestStatusOptions,
  useProcurementDeepLink,
  useProcurementListTabState,
  type ProcurementDocumentRef,
  type ProcurementListState,
  type ProcurementOrderRow,
  type ProcurementRequestRow,
  type ProcurementViewVisibility,
} from "@/v2/core/procurement";
import {
  garageProcurementRequestsConfig,
  garageProcurementRequestsDisplay,
} from "./garageProcurementRequests.config";
import {
  garageProcurementOrdersConfig,
  garageProcurementOrdersDisplay,
} from "../garage-procurement-orders/garageProcurementOrders.config";

type T = (key: string, fallback: string) => string;

export function resolveDrawerTarget<T>(
  row: ProcurementDocumentRef | undefined,
  openId: string | null,
): T | null {
  const target = row ?? (openId ? { id: openId } : null);
  return target as T | null;
}

const isTabKey = (value: string | null): value is "requests" | "orders" =>
  value === "orders" || value === "requests";

/**
 * Tab đang mở: lấy từ `?tab=`, thiếu thì đặt về "requests" trên URL.
 * Theo dõi URL: khi `?tab=` đổi lúc đang mở trang (ví dụ bấm thông báo) thì chuyển tab theo.
 */
export function useGarageProcurementActiveTab(
  defaultTab: "requests" | "orders",
) {
  const urlTab = useV2SearchParams().get("tab");
  const [activeTab, setActiveTab] = React.useState<string>(() =>
    isTabKey(urlTab) ? urlTab : defaultTab,
  );

  React.useEffect(() => {
    if (isTabKey(urlTab)) setActiveTab(urlTab);
  }, [urlTab]);

  React.useEffect(() => {
    if (!urlTab) {
      updateV2SearchParams((search) => {
        search.set("tab", "requests");
      }, "replace");
    }
  }, [urlTab]);

  return [activeTab, setActiveTab] as const;
}

/** Trạng thái đưa vào nhóm lọc có sẵn của từng tab (khớp vòng đời PR và PO) */
const REQUEST_FILTER_STATUSES = ["DRAFT", "PENDING_APPROVAL", "APPROVED"];
const ORDER_FILTER_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "ISSUED",
];

const NO_VIEWS: ProcurementViewVisibility = {};

/** Trạng thái hai tab (đề nghị và đơn mua): bộ lọc, chế độ xem, cột và thao tác dòng. */
export function useGarageProcurementListStates(
  t: T,
  requestsState: ProcurementListState<ProcurementRequestRow>,
  ordersState: ProcurementListState<ProcurementOrderRow>,
) {
  const requestStatusItems = React.useMemo(
    () =>
      getRequestStatusOptions(t).filter((o) =>
        REQUEST_FILTER_STATUSES.includes(o.value),
      ),
    [t],
  );
  const orderStatusItems = React.useMemo(
    () =>
      getOrderStatusOptions(t).filter((o) =>
        ORDER_FILTER_STATUSES.includes(o.value),
      ),
    [t],
  );

  const requests = useProcurementListTabState<ProcurementRequestRow>({
    t,
    tableId: garageProcurementRequestsDisplay.tableId,
    state: requestsState,
    api: garageProcurementRequestsConfig.api,
    viewVisibility: garageProcurementRequestsDisplay.viewVisibility ?? NO_VIEWS,
    buildColumns: garageProcurementRequestsDisplay.buildColumns,
    statusItems: requestStatusItems,
  });

  // Bấm thông báo mở đúng phiếu (?open=&action=) trên tab đề nghị
  useProcurementDeepLink(garageProcurementRequestsConfig, requestsState);

  const orders = useProcurementListTabState<ProcurementOrderRow>({
    t,
    tableId: garageProcurementOrdersDisplay.tableId,
    state: ordersState,
    api: garageProcurementOrdersConfig.api,
    viewVisibility: garageProcurementOrdersDisplay.viewVisibility ?? NO_VIEWS,
    buildColumns: garageProcurementOrdersDisplay.buildColumns,
    statusItems: orderStatusItems,
  });

  return { requests, orders };
}
