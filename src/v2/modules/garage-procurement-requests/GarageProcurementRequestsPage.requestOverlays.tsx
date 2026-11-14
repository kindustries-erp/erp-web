import * as React from "react";
import {
  ProcurementListModals,
  type ProcurementRequestRow,
  type useProcurementList,
} from "@/v2/core/procurement";
import { GarageInvoiceAssistant } from "./GarageInvoiceAssistant";
import {
  garageProcurementRequestsConfig,
  garageProcurementRequestsDisplay,
} from "./garageProcurementRequests.config";
import { resolveDrawerTarget } from "./GarageProcurementRequestsPage.hook";

export interface GarageRequestOverlaysProps {
  state: ReturnType<typeof useProcurementList<ProcurementRequestRow>>;
  /** Tab đề nghị đang hiển thị: chỉ khi đó mới hiện trợ lý AI đọc hóa đơn */
  active: boolean;
}

/** Lớp phủ của tab đề nghị mua: drawer, modal xác nhận và trợ lý AI đọc hóa đơn. */
export function GarageRequestOverlays({
  state,
  active,
}: GarageRequestOverlaysProps) {
  return (
    <>
      {state.drawer && (
        <React.Fragment
          key={`pr-${state.drawer.id ?? "new"}-${state.drawer.mode}`}
        >
          {garageProcurementRequestsDisplay.renderDrawer({
            open: true,
            documentId: state.drawer.id,
            mode: state.drawer.mode,
            canUpdate: state.canUpdate,
            onClose: state.closeDrawer,
            queryKey: garageProcurementRequestsConfig.queryKey,
            api: garageProcurementRequestsConfig.api,
            fromRequestId: state.drawer.fromRequestId ?? null,
            approval: state.approval.gate,
            approvalConfigPath:
              garageProcurementRequestsConfig.approvalConfigPath,
            requestApi: garageProcurementRequestsConfig.requestApi,
            onTransition: (action, row) => {
              const target = resolveDrawerTarget<ProcurementRequestRow>(
                row,
                state.drawer?.id ?? null,
              );
              if (target) state.start(target, action);
            },
            onSaved: state.openSaved,
            canCreateOrder: state.canCreate,
            onOrderFromRequest: (row) => {
              const target = resolveDrawerTarget<ProcurementRequestRow>(
                row,
                state.drawer?.id ?? null,
              );
              if (target) {
                state.orderFromRequest(target);
              }
            },
          })}
        </React.Fragment>
      )}
      <ProcurementListModals
        config={garageProcurementRequestsConfig}
        state={state}
      />
      {active && <GarageInvoiceAssistant onCreated={state.openSaved} />}
    </>
  );
}
