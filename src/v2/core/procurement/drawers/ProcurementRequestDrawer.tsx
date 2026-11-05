import { V2StandardDrawer } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementDrawerProps } from "./procurementDrawer.type";
import { useProcurementRequestDrawer } from "./ProcurementRequestDrawer.hook";
import {
  ProcurementRequestMainSections,
  ProcurementRequestSummary,
} from "./ProcurementRequestDrawer.sections";

/** Drawer đề nghị mua 2 cột: trái là đầu đề và dòng hàng, phải là tổng quan. */
export function ProcurementRequestDrawer(props: ProcurementDrawerProps) {
  const { t } = useV2Translation();
  const state = useProcurementRequestDrawer(props);
  const title = state.creating
    ? t("v2.procurement.drawer.createRequest", "Tạo đề nghị mua")
    : t("v2.procurement.drawer.request", "Đề nghị mua");

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
      layout="2-columns"
      size="xl"
      loading={state.loading}
      actions={
        state.viewing
          ? [
              {
                label: t("v2.common.close", "Đóng"),
                onClick: props.onClose,
                variant: "outline",
              },
            ]
          : [
              {
                label: t("v2.common.cancel", "Hủy"),
                onClick: props.onClose,
                variant: "outline",
                disabled: state.saving,
              },
              {
                label: t("v2.common.save", "Lưu"),
                onClick: state.submit,
                primary: true,
                loading: state.saving,
                disabled: state.saving || state.loading,
              },
            ]
      }
      leftPanel={
        <ProcurementRequestMainSections
          form={state.form}
          errors={state.errors}
          headerViewing={state.headerViewing}
          linesViewing={state.linesViewing}
          branchLocked={state.branchLocked}
          detail={state.detail}
          setField={state.setField}
        />
      }
      rightPanel={
        <ProcurementRequestSummary form={state.form} detail={state.detail} />
      }
    />
  );
}
