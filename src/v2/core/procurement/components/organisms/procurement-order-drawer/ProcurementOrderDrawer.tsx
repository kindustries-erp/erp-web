import { V2StandardDrawer } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementDrawerProps } from "../../../procurement.drawer.type";
import { useProcurementOrderDrawer } from "./ProcurementOrderDrawer.hook";
import { ProcurementOrderMainSections } from "./ProcurementOrderMainSections";
import { ProcurementOrderSummarySection } from "./sections/ProcurementOrderSummarySection";

/** Drawer đơn mua hàng 2 cột: trái là đầu đơn và dòng hàng, phải là tổng quan. */
export function ProcurementOrderDrawer(props: ProcurementDrawerProps) {
  const { t } = useV2Translation();
  const state = useProcurementOrderDrawer(props);
  const title = state.creating
    ? t("v2.procurement.drawer.createOrder", "Tạo đơn mua hàng")
    : t("v2.procurement.drawer.order", "Đơn mua hàng");

  return (
    <V2StandardDrawer
      id={`procurement-order-${props.documentId ?? "new"}`}
      open={props.open}
      onClose={props.onClose}
      mode={state.viewing ? "view" : "edit"}
      onToggleEdit={
        state.viewing && state.editable && props.canUpdate && !state.creating
          ? () => state.setMode("edit")
          : undefined
      }
      title={title}
      subtitle={state.detail?.orderNo}
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
        <ProcurementOrderMainSections
          form={state.form}
          errors={state.errors}
          viewing={state.viewing}
          branchLocked={state.branchLocked}
          setField={state.setField}
        />
      }
      rightPanel={
        <ProcurementOrderSummarySection
          form={state.form}
          detail={state.detail}
        />
      }
    />
  );
}
