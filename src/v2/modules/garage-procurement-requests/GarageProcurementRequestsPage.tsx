import * as React from "react";
import {
  useProcurementList,
  ProcurementListModals,
  type ProcurementRequestRow,
  type ProcurementOrderRow,
  useProcurementWorkflowMenu,
} from "@/v2/core/procurement";
import { V2ModulePage, type V2ModuleTab } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  garageProcurementRequestsConfig,
  garageProcurementRequestsDisplay,
} from "./garageProcurementRequests.config";
import {
  garageProcurementOrdersConfig,
  garageProcurementOrdersDisplay,
} from "../garage-procurement-orders/garageProcurementOrders.config";
import {
  resolveDrawerTarget,
  useGarageProcurementActiveTab,
  useGarageProcurementListStates,
} from "./GarageProcurementRequestsPage.hook";
import { useGarageProcurementPageActions } from "./GarageProcurementRequestsPage.actions";
import { buildGarageProcurementTabs } from "./GarageProcurementRequestsPage.tabs";
import "./garageProcurementRequests.locale";
import "../garage-procurement-orders/garageProcurementOrders.locale";

export interface GarageProcurementRequestsPageProps {
  defaultTab?: "requests" | "orders";
}

export function GarageProcurementRequestsPage({
  defaultTab = "requests",
}: GarageProcurementRequestsPageProps = {}) {
  const { t } = useV2Translation();

  const [activeTab, setActiveTab] = useGarageProcurementActiveTab(defaultTab);

  const requestsState = useProcurementList(garageProcurementRequestsConfig);
  const ordersState = useProcurementList(garageProcurementOrdersConfig);

  const { requests: requestTab, orders: orderTab } =
    useGarageProcurementListStates(t, requestsState, ordersState);

  const tabs = React.useMemo<V2ModuleTab<any>[]>(
    () =>
      buildGarageProcurementTabs({
        t,
        requests: requestTab,
        orders: orderTab,
        onRequestsError: requestsState.onListError,
        onOrdersError: ordersState.onListError,
      }),
    [
      orderTab,
      ordersState.onListError,
      requestTab,
      requestsState.onListError,
      t,
    ],
  );

  const isOrders = activeTab === "orders";
  const workflow = useProcurementWorkflowMenu("end-user");

  const { actions, icon: currentIcon } = useGarageProcurementPageActions({
    t,
    isOrders,
    requestsState,
    ordersState,
    workflow,
  });

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
      actions={actions}
      overlays={
        <>
          {workflow.drawer}
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
                directConfirm: Boolean(
                  garageProcurementOrdersConfig.directConfirmWhenApprovalOff,
                ),
                requestApi: garageProcurementOrdersConfig.requestApi,
                onTransition: (action, row) => {
                  const target = resolveDrawerTarget<ProcurementOrderRow>(
                    row,
                    ordersState.drawer?.id ?? null,
                  );
                  if (target) ordersState.start(target, action);
                },
                onSaved: ordersState.openSaved,
                receive: ordersState.canReceive
                  ? {
                      canReceive: (order) =>
                        garageProcurementOrdersConfig.canReceive?.(
                          order as unknown as ProcurementOrderRow,
                        ) ?? false,
                      onReceive: (row) => {
                        const target = resolveDrawerTarget<ProcurementOrderRow>(
                          row,
                          ordersState.drawer?.id ?? null,
                        );
                        if (target) ordersState.receive(target);
                      },
                    }
                  : undefined,
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
