import * as React from "react";
import {
  ProcurementListModals,
  type ProcurementOrderRow,
  type useProcurementList,
} from "@/v2/core/procurement";
import {
  garageProcurementOrdersConfig,
  garageProcurementOrdersDisplay,
} from "../garage-procurement-orders/garageProcurementOrders.config";
import { resolveDrawerTarget } from "./GarageProcurementRequestsPage.hook";

export interface GarageOrderOverlaysProps {
  state: ReturnType<typeof useProcurementList<ProcurementOrderRow>>;
}

/** Lớp phủ của tab đơn mua: drawer và modal xác nhận. */
export function GarageOrderOverlays({ state }: GarageOrderOverlaysProps) {
  return (
    <>
      {state.drawer && (
        <React.Fragment
          key={`po-${state.drawer.id ?? "new"}-${state.drawer.mode}`}
        >
          {garageProcurementOrdersDisplay.renderDrawer({
            open: true,
            documentId: state.drawer.id,
            mode: state.drawer.mode,
            canUpdate: state.canUpdate,
            onClose: state.closeDrawer,
            queryKey: garageProcurementOrdersConfig.queryKey,
            api: garageProcurementOrdersConfig.api,
            fromRequestId: state.drawer.fromRequestId ?? null,
            approval: state.approval.gate,
            approvalConfigPath:
              garageProcurementOrdersConfig.approvalConfigPath,
            directConfirm: Boolean(
              garageProcurementOrdersConfig.directConfirmWhenApprovalOff,
            ),
            requestApi: garageProcurementOrdersConfig.requestApi,
            onTransition: (action, row) => {
              const target = resolveDrawerTarget<ProcurementOrderRow>(
                row,
                state.drawer?.id ?? null,
              );
              if (target) state.start(target, action);
            },
            onSaved: state.openSaved,
            receive: state.canReceive
              ? {
                  canReceive: (order) =>
                    garageProcurementOrdersConfig.canReceive?.(
                      order as unknown as ProcurementOrderRow,
                    ) ?? false,
                  onReceive: (row) => {
                    const target = resolveDrawerTarget<ProcurementOrderRow>(
                      row,
                      state.drawer?.id ?? null,
                    );
                    if (target) state.receive(target);
                  },
                }
              : undefined,
            receiptHistory: garageProcurementOrdersConfig.loadReceipts
              ? {
                  load: garageProcurementOrdersConfig.loadReceipts,
                  onOpen: state.openReceipt,
                }
              : undefined,
            canCreateOrder: false,
          })}
        </React.Fragment>
      )}
      <ProcurementListModals
        config={garageProcurementOrdersConfig}
        state={state}
      />
    </>
  );
}
