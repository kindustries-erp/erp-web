import * as React from "react";
import { FileText, History, Link2 } from "lucide-react";
import { V2StandardDrawer } from "@/v2/shared/components";
import type { V2TabItemData } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementDrawerProps } from "../../../procurement.drawer.type";
import { ProcurementDiscardModal } from "../../ProcurementDiscardModal";
import { ProcurementStatusBadge } from "../../molecules/procurement-status-badge";
import {
  useProcurementRequestDrawer,
  type ProcurementDrawerTabKey,
} from "./ProcurementRequestDrawer.hook";
import { ProcurementRequestMainSections } from "./ProcurementRequestMainSections";
import { ProcurementRequestHeaderSection } from "./sections/ProcurementRequestHeaderSection";
import { ProcurementRequestSummarySection } from "./sections/ProcurementRequestSummarySection";
import { ProcurementRequestApprovalTab } from "./tabs/ProcurementRequestApprovalTab";
import { ProcurementRequestRelatedTab } from "./tabs/ProcurementRequestRelatedTab";
import { useProcurementDrawerActions } from "./ProcurementRequestDrawer.biz.hook";

/** Drawer đề nghị mua chuẩn V2: 3 top navigation tabs, 2 cột và thao tác duyệt trực tiếp. */
export function ProcurementRequestDrawer(props: ProcurementDrawerProps) {
  const { t } = useV2Translation();
  const state = useProcurementRequestDrawer(props);
  const title = state.creating
    ? t("v2.procurement.drawer.createRequest", "Tạo đề nghị mua")
    : state.viewing
      ? t("v2.procurement.drawer.request", "Đề nghị mua")
      : t("v2.procurement.drawer.editRequest", "Sửa đề nghị mua");

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
    onCancelEdit: state.cancelEdit,
    onSubmit: state.submit,
    onTransition: props.onTransition,
  });

  const isGeneral = state.tab === "general";
  const detail = state.detail;
  const onOrderFromRequest = props.onOrderFromRequest;
  const leftPanel = isGeneral ? (
    <ProcurementRequestMainSections
      form={state.form}
      errors={state.errors}
      linesViewing={state.linesViewing}
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
      detail={detail}
      canCreateOrder={props.canCreateOrder}
      onOrderFromRequest={
        detail && onOrderFromRequest
          ? () => onOrderFromRequest(detail)
          : undefined
      }
    />
  );

  return (
    <>
      <V2StandardDrawer
        id={`procurement-request-${props.documentId ?? "new"}`}
        open={props.open}
        onClose={props.onClose}
        mode={state.viewing ? "view" : "edit"}
        onToggleEdit={
          !state.creating && state.editable && props.canUpdate && state.viewing
            ? () => state.setMode("edit")
            : undefined
        }
        confirmOnClose={state.dirty && !state.viewing}
        title={title}
        titleExtra={
          state.detail ? (
            <ProcurementStatusBadge value={state.status} t={t} />
          ) : undefined
        }
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
        actionDropdownTriggerLabel={t(
          "v2.procurement.actions.more",
          "Thao tác",
        )}
        leftPanel={leftPanel}
        rightPanel={
          isGeneral ? (
            <div className="space-y-3">
              <ProcurementRequestHeaderSection
                form={state.form}
                errors={state.errors}
                headerViewing={state.headerViewing}
                branchLocked={state.branchLocked}
                branchOptional={state.branchOptional}
                setField={state.setField}
              />
              <ProcurementRequestSummarySection
                form={state.form}
                detail={state.detail}
              />
            </div>
          ) : undefined
        }
      />
      <ProcurementDiscardModal
        open={state.discardOpen}
        onCancel={state.closeDiscard}
        onConfirm={state.confirmDiscard}
      />
    </>
  );
}
