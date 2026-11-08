import * as React from "react";
import { ClipboardList, ShoppingCart } from "lucide-react";
import {
  useProcurementList,
  useProcurementQuery,
  ProcurementListModals,
  type ProcurementRequestRow,
  type ProcurementOrderRow,
  type ProcurementDocumentRef,
} from "@/v2/core/procurement";
import { V2ModulePage, type V2ModuleTab } from "@/v2/shared/components";
import { V2SplitButton } from "@/v2/shared/components/molecules/v2-split-button";
import {
  V2Dropdown,
  type V2DropdownGroup,
} from "@/v2/shared/components/molecules/v2-dropdown";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  garageProcurementRequestsConfig,
  garageProcurementRequestsDisplay,
} from "./garageProcurementRequests.config";
import {
  garageProcurementOrdersConfig,
  garageProcurementOrdersDisplay,
} from "../garage-procurement-orders/garageProcurementOrders.config";
import "./garageProcurementRequests.locale";
import "../garage-procurement-orders/garageProcurementOrders.locale";

function resolveDrawerTarget<T>(
  row: ProcurementDocumentRef | undefined,
  openId: string | null,
): T | null {
  const target = row ?? (openId ? { id: openId } : null);
  return target as T | null;
}

export interface GarageProcurementRequestsPageProps {
  defaultTab?: "requests" | "orders";
}

export function GarageProcurementRequestsPage({
  defaultTab = "requests",
}: GarageProcurementRequestsPageProps = {}) {
  const { t } = useV2Translation();

  const [activeTab, setActiveTab] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "orders" || tab === "requests") return tab;
    }
    return defaultTab;
  });

  const requestsState = useProcurementList(garageProcurementRequestsConfig);
  const ordersState = useProcurementList(garageProcurementOrdersConfig);

  const requestColumns = React.useMemo(
    () =>
      garageProcurementRequestsDisplay.buildColumns(t, requestsState.openView),
    [requestsState.openView, t],
  );

  const orderColumns = React.useMemo(
    () => garageProcurementOrdersDisplay.buildColumns(t, ordersState.openView),
    [ordersState.openView, t],
  );

  const tabs = React.useMemo<V2ModuleTab<any>[]>(
    () => [
      {
        key: "requests",
        label: t("v2.garageProcurementRequests.tab", "Đề nghị mua hàng"),
        icon: <ClipboardList className="h-4 w-4" />,
        kind: "list",
        resetKey: garageProcurementRequestsDisplay.tableId,
        table: {
          tableId: garageProcurementRequestsDisplay.tableId,
          columns: requestColumns,
          getRowKey: (row: ProcurementRequestRow) => row.id,
          mode: "server",
          fetchOptions: garageProcurementRequestsConfig.api.options,
          rowActions: requestsState.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.procurement.empty", "Không có dữ liệu"),
          toolbar: { search: {} },
        },
        useData: (query) =>
          useProcurementQuery(
            garageProcurementRequestsConfig,
            query,
            requestsState.onListError,
          ),
      },
      {
        key: "orders",
        label: t("v2.garageProcurementOrders.tab", "Đơn mua hàng"),
        icon: <ShoppingCart className="h-4 w-4" />,
        kind: "list",
        resetKey: garageProcurementOrdersDisplay.tableId,
        table: {
          tableId: garageProcurementOrdersDisplay.tableId,
          columns: orderColumns,
          getRowKey: (row: ProcurementOrderRow) => row.id,
          mode: "server",
          fetchOptions: garageProcurementOrdersConfig.api.options,
          rowActions: ordersState.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.procurement.empty", "Không có dữ liệu"),
          toolbar: { search: {} },
        },
        useData: (query) =>
          useProcurementQuery(
            garageProcurementOrdersConfig,
            query,
            ordersState.onListError,
          ),
      },
    ],
    [orderColumns, ordersState, requestColumns, requestsState, t],
  );

  const isOrders = activeTab === "orders";

  const actionDropdownGroups = React.useMemo<V2DropdownGroup[]>(
    () => [
      {
        items: [
          {
            id: "create-request",
            label: t(
              "v2.garageProcurementRequests.tab",
              "Tạo đề nghị mua hàng",
            ),
            icon: <ClipboardList className="h-4 w-4" />,
            onClick: requestsState.openCreate,
            disabled: !requestsState.canCreate,
          },
          {
            id: "create-order",
            label: t("v2.garageProcurementOrders.tab", "Tạo đơn mua hàng"),
            icon: <ShoppingCart className="h-4 w-4" />,
            onClick: ordersState.openCreate,
            disabled: !ordersState.canCreate,
          },
        ],
      },
    ],
    [
      ordersState.canCreate,
      ordersState.openCreate,
      requestsState.canCreate,
      requestsState.openCreate,
      t,
    ],
  );

  const canCreateCurrent = isOrders
    ? ordersState.canCreate
    : requestsState.canCreate;

  const currentCreateAction = isOrders
    ? ordersState.openCreate
    : requestsState.openCreate;

  const currentActionLabel = isOrders
    ? t("v2.garageProcurementOrders.create", "Tạo đơn mua")
    : t("v2.garageProcurementRequests.create", "Tạo đề nghị");

  const currentIcon = isOrders ? (
    <ShoppingCart className="h-4 w-4" />
  ) : (
    <ClipboardList className="h-4 w-4" />
  );

  return (
    <V2ModulePage<any>
      title={
        isOrders
          ? t("v2.garageProcurementOrders.title", "Đơn mua hàng Garage")
          : t("v2.garageProcurementRequests.title", "Đề nghị mua hàng Garage")
      }
      description={
        isOrders
          ? t(
              "v2.garageProcurementOrders.description",
              "Đơn mua phụ tùng cho garage, nhận hàng qua phiếu nhập kho",
            )
          : t(
              "v2.garageProcurementRequests.description",
              "Đề nghị mua phụ tùng, duyệt trước khi lập đơn mua",
            )
      }
      icon={currentIcon}
      tabs={tabs}
      defaultTab={defaultTab}
      onTabChange={setActiveTab}
      syncUrl={true}
      actions={
        canCreateCurrent ? (
          <V2SplitButton
            label={currentActionLabel}
            icon={currentIcon}
            onClick={currentCreateAction}
            renderMenu={(trigger) => (
              <V2Dropdown
                groups={actionDropdownGroups}
                trigger={trigger}
                align="end"
              />
            )}
          />
        ) : undefined
      }
      overlays={
        <>
          {requestsState.drawer && (
            <React.Fragment
              key={`pr-${requestsState.drawer.id ?? "new"}-${requestsState.drawer.mode}`}
            >
              {garageProcurementRequestsDisplay.renderDrawer({
                open: true,
                documentId: requestsState.drawer.id,
                mode: requestsState.drawer.mode,
                canUpdate: requestsState.canUpdate,
                onClose: requestsState.closeDrawer,
                queryKey: garageProcurementRequestsConfig.queryKey,
                api: garageProcurementRequestsConfig.api,
                fromRequestId: requestsState.drawer.fromRequestId ?? null,
                approval: requestsState.approval.gate,
                requestApi: garageProcurementRequestsConfig.requestApi,
                onTransition: (action, row) => {
                  const target = resolveDrawerTarget<ProcurementRequestRow>(
                    row,
                    requestsState.drawer?.id ?? null,
                  );
                  if (target) requestsState.start(target, action);
                },
                onSaved: requestsState.openSaved,
                canCreateOrder: requestsState.canCreate,
                onOrderFromRequest: (row) => {
                  const target = resolveDrawerTarget<ProcurementRequestRow>(
                    row,
                    requestsState.drawer?.id ?? null,
                  );
                  if (target) {
                    requestsState.orderFromRequest(target);
                  }
                },
              })}
            </React.Fragment>
          )}
          <ProcurementListModals
            config={garageProcurementRequestsConfig}
            state={requestsState}
          />

          {ordersState.drawer && (
            <React.Fragment
              key={`po-${ordersState.drawer.id ?? "new"}-${ordersState.drawer.mode}`}
            >
              {garageProcurementOrdersDisplay.renderDrawer({
                open: true,
                documentId: ordersState.drawer.id,
                mode: ordersState.drawer.mode,
                canUpdate: ordersState.canUpdate,
                onClose: ordersState.closeDrawer,
                queryKey: garageProcurementOrdersConfig.queryKey,
                api: garageProcurementOrdersConfig.api,
                fromRequestId: ordersState.drawer.fromRequestId ?? null,
                approval: ordersState.approval.gate,
                requestApi: garageProcurementOrdersConfig.requestApi,
                onTransition: (action, row) => {
                  const target = resolveDrawerTarget<ProcurementOrderRow>(
                    row,
                    ordersState.drawer?.id ?? null,
                  );
                  if (target) ordersState.start(target, action);
                },
                onSaved: ordersState.openSaved,
                canCreateOrder: false,
              })}
            </React.Fragment>
          )}
          <ProcurementListModals
            config={garageProcurementOrdersConfig}
            state={ordersState}
          />
        </>
      }
    />
  );
}

export { GarageProcurementRequestsPage as GarageProcurementPage };
