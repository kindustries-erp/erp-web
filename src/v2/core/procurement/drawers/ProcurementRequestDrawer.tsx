import * as React from "react";
import { FileText, History, Link2 } from "lucide-react";
import { V2StandardDrawer } from "@/v2/shared/components";
import type { V2TabItemData } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementDrawerProps } from "./procurementDrawer.type";
import {
  useProcurementRequestDrawer,
  type ProcurementDrawerTabKey,
} from "./ProcurementRequestDrawer.hook";
import {
  ProcurementRequestMainSections,
  ProcurementRequestSummary,
} from "./ProcurementRequestDrawer.sections";
import { ProcurementRequestApprovalTab } from "./tabs/ProcurementRequestApprovalTab";
import { ProcurementRequestRelatedTab } from "./tabs/ProcurementRequestRelatedTab";
import { useProcurementDrawerActions } from "./useProcurementDrawerActions";

/** Drawer đề nghị mua chuẩn V2: 3 top navigation tabs, 2 cột và thao tác duyệt trực tiếp. */
export function ProcurementRequestDrawer(props: ProcurementDrawerProps) {
  const { t } = useV2Translation();
  const state = useProcurementRequestDrawer(props);
  const title = state.creating
    ? t("v2.procurement.drawer.createRequest", "Tạo đề nghị mua")
    : t("v2.procurement.drawer.request", "Đề nghị mua");

  const tabs: V2TabItemData[] = React.useMemo(() => {
    if (state.creating) return [];
    return [
      {
        key: "general",
        label: t("v2.procurement.drawer.tabGeneral", "Chi tiết"),
        icon: <FileText className="h-4 w-4" />,
      },
      {
        key: "audit",
        label: t("v2.procurement.drawer.tabAudit", "Nhật ký duyệt"),
        icon: <History className="h-4 w-4" />,
      },
      {
        key: "traceability",
        label: t("v2.procurement.drawer.tabTraceability", "Chứng từ liên kết"),
        icon: <Link2 className="h-4 w-4" />,
      },
    ];
  }, [state.creating, t]);

  const { actions, actionDropdownItems } = useProcurementDrawerActions({
    viewing: state.viewing,
    canUpdate: props.canUpdate,
    availableActions: state.availableActions,
    detail: state.detail,
    saving: state.saving,
    loading: state.loading,
    onClose: props.onClose,
    onSubmit: state.submit,
    onTransition: props.onTransition,
  });

  const isGeneral = state.tab === "general";
  const leftPanel = isGeneral ? (
    <ProcurementRequestMainSections
      form={state.form}
      errors={state.errors}
      headerViewing={state.headerViewing}
      linesViewing={state.linesViewing}
      branchLocked={state.branchLocked}
      detail={state.detail}
      setField={state.setField}
    />
  ) : state.tab === "audit" ? (
    <ProcurementRequestApprovalTab
      documentId={props.documentId}
      api={props.api}
      queryKey={props.queryKey}
    />
  ) : (
    <ProcurementRequestRelatedTab
      detail={state.detail}
      canCreateOrder={props.canCreateOrder}
      onOrderFromRequest={
        state.detail && props.onOrderFromRequest
          ? () => props.onOrderFromRequest!(state.detail)
          : undefined
      }
    />
  );

  return (
    <V2StandardDrawer
      id={`procurement-request-${props.documentId ?? "new"}`}
      open={props.open}
      onClose={props.onClose}
      mode={state.viewing ? "view" : "edit"}
      onToggleEdit={
        !state.creating &&
        state.editable &&
        props.canUpdate &&
        state.linesViewing
          ? () => state.setMode("edit")
          : undefined
      }
      title={title}
      subtitle={state.detail?.requestNo}
      layout={isGeneral ? "2-columns" : "1-column"}
      size="xl"
      loading={state.loading}
      tabs={tabs.length ? tabs : undefined}
      activeTabKey={state.tab}
      onTabChange={(k) => state.setTab(k as ProcurementDrawerTabKey)}
      actions={actions}
      actionDropdownItems={
        actionDropdownItems.length ? actionDropdownItems : undefined
      }
      actionDropdownTriggerLabel={t("v2.procurement.actions.more", "Thao tác")}
      leftPanel={leftPanel}
      rightPanel={
        isGeneral ? (
          <ProcurementRequestSummary form={state.form} detail={state.detail} />
        ) : undefined
      }
    />
  );
}
