import * as React from "react";
import { ClipboardList, ShoppingCart } from "lucide-react";
import {
  useProcurementQuery,
  type ProcurementListConfig,
  type ProcurementListTabState,
  type ProcurementOrderRow,
  type ProcurementRequestRow,
} from "@/v2/core/procurement";
import type { V2ModuleTab } from "@/v2/shared/components";
import { V2Icon } from "@/v2/shared/components/atoms";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import {
  garageProcurementRequestsConfig,
  garageProcurementRequestsDisplay,
} from "./garageProcurementRequests.config";
import {
  garageProcurementOrdersConfig,
  garageProcurementOrdersDisplay,
} from "../garage-procurement-orders/garageProcurementOrders.config";

type T = (key: string, fallback: string) => string;

interface ProcurementTabInput<R extends { id: string }> {
  key: string;
  label: string;
  icon: React.ReactNode;
  config: ProcurementListConfig<R>;
  tableId: string;
  state: ProcurementListTabState<R>;
  onError: (error: unknown) => void;
  emptyLabel: string;
}

/** Tab danh sách server-side: bảng V2 với bộ lọc có sẵn và chế độ xem của procurement. */
function buildListTab<R extends { id: string }>(
  input: ProcurementTabInput<R>,
): V2ModuleTab<R> {
  const { config, state } = input;
  return {
    key: input.key,
    label: input.label,
    icon: input.icon,
    kind: "list",
    resetKey: state.resetKey,
    table: {
      tableId: input.tableId,
      columns: state.columns,
      getRowKey: (row: R) => row.id,
      mode: "server",
      fetchOptions: state.fetchOptions,
      rowActions: state.rowActions,
      preferencesStorage: v2ColumnPreferencesStorage,
      viewPresetStorage: v2ViewPresetStorage,
      emptyLabel: input.emptyLabel,
      toolbar: {
        search: {},
        filterGroup: state.filterGroup,
        viewModes: state.viewModes,
      },
    },
    useData: (query) =>
      useProcurementQuery(config, { ...query, ...state.filter }, input.onError),
  };
}

/** Hai tab của trang Garage procurement: đề nghị mua hàng và đơn mua hàng. */
export function buildGarageProcurementTabs(args: {
  t: T;
  requests: ProcurementListTabState<ProcurementRequestRow>;
  orders: ProcurementListTabState<ProcurementOrderRow>;
  onRequestsError: (error: unknown) => void;
  onOrdersError: (error: unknown) => void;
}): V2ModuleTab<any>[] {
  const { t, requests, orders } = args;
  return [
    buildListTab<ProcurementRequestRow>({
      key: "requests",
      label: t("v2.garageProcurementRequests.tab", "Đề nghị mua hàng"),
      icon: <V2Icon icon={ClipboardList} size={15} />,
      config: garageProcurementRequestsConfig,
      tableId: garageProcurementRequestsDisplay.tableId,
      state: requests,
      onError: args.onRequestsError,
      emptyLabel: t("v2.procurement.empty", "Không có dữ liệu"),
    }),
    buildListTab<ProcurementOrderRow>({
      key: "orders",
      label: t("v2.garageProcurementOrders.tab", "Đơn mua hàng"),
      icon: <V2Icon icon={ShoppingCart} size={15} />,
      config: garageProcurementOrdersConfig,
      tableId: garageProcurementOrdersDisplay.tableId,
      state: orders,
      onError: args.onOrdersError,
      emptyLabel: t("v2.procurement.empty", "Không có dữ liệu"),
    }),
  ];
}
