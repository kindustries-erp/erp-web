import { LineItemCodeFieldProvider } from "@/v2/shared/context/LineItemCodeFieldContext";
import { GarageItemCodeField } from "@/v2/modules/items-garage";
import * as React from "react";
import {
  useProcurementList,
  useProcurementWorkflowMenu,
} from "@/v2/core/procurement";
import { V2ModulePage, type V2ModuleTab } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { garageProcurementRequestsConfig } from "./garageProcurementRequests.config";
import { garageProcurementOrdersConfig } from "../garage-procurement-orders/garageProcurementOrders.config";
import {
  useGarageProcurementActiveTab,
  useGarageProcurementListStates,
} from "./GarageProcurementRequestsPage.hook";
import { useGarageProcurementPageActions } from "./GarageProcurementRequestsPage.actions";
import { buildGarageProcurementTabs } from "./GarageProcurementRequestsPage.tabs";
import { GarageOrderOverlays } from "./GarageProcurementRequestsPage.orderOverlays";
import { GarageRequestOverlays } from "./GarageProcurementRequestsPage.requestOverlays";
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
        <LineItemCodeFieldProvider value={GarageItemCodeField}>
          {workflow.drawer}
          <GarageRequestOverlays state={requestsState} active={!isOrders} />
          <GarageOrderOverlays state={ordersState} />
        </LineItemCodeFieldProvider>
      }
    />
  );
}

export { GarageProcurementRequestsPage as GarageProcurementPage };
