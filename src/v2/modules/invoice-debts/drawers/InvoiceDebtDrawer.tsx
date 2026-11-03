import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { InvoiceDebtStatusBadge } from "../components/molecules/invoice-debt-status-badge";
import { InvoiceDebtFormSections } from "../components/organisms/invoice-debt-form";
import type { InvoiceDebtDrawerState } from "./InvoiceDebtDrawer.hook";
import { useInvoiceDebtDrawer } from "./InvoiceDebtDrawer.hook";

export function InvoiceDebtDrawer(props: InvoiceDebtDrawerState) {
  const { t } = useV2Translation();
  const state = useInvoiceDebtDrawer(props);
  const title = state.creating
    ? t("v2.invoiceDebts.form.create", "Thêm mới")
    : state.viewing
      ? t("v2.invoiceDebts.form.detail", "Chi tiết")
      : t("v2.invoiceDebts.form.edit", "Chỉnh sửa");

  return (
    <V2StandardDrawer
      id={`invoiceDebt-${props.recordId ?? "new"}`}
      open={props.open}
      onClose={props.onClose}
      mode={state.creating ? "edit" : state.mode}
      onToggleEdit={
        state.viewing && props.canUpdate
          ? () => state.setMode("edit")
          : undefined
      }
      title={title}
      subtitle={state.form.search || undefined}
      titleExtra={
        !state.creating ? (
          <InvoiceDebtStatusBadge status={state.form.partnerType} />
        ) : undefined
      }
      layout="1-column"
      size="md"
      loading={state.loading}
      confirmOnClose={state.dirty && !state.viewing}
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
    >
      <InvoiceDebtFormSections
        form={state.form}
        viewing={state.viewing}
        errorField={state.errorField}
        errorMessage={state.errorMessage}
        t={t}
        setField={state.setField}
      />
    </V2StandardDrawer>
  );
}
