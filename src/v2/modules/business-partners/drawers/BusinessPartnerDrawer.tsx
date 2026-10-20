import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { BusinessPartnerStatusBadge } from "../components/molecules/business-partner-status-badge";
import { BusinessPartnerFormSections } from "../components/organisms/business-partner-form";
import type { BusinessPartnerDrawerState } from "./BusinessPartnerDrawer.hook";
import { useBusinessPartnerDrawer } from "./BusinessPartnerDrawer.hook";

export function BusinessPartnerDrawer(props: BusinessPartnerDrawerState) {
  const { t } = useV2Translation();
  const state = useBusinessPartnerDrawer(props);
  const type = t(
    props.partnerType === "VENDOR"
      ? "v2.partners.form.supplier"
      : "v2.partners.form.customer",
    props.partnerType === "VENDOR" ? "nhà cung cấp" : "khách hàng",
  );
  const titleKey = state.creating
    ? "v2.partners.form.create"
    : state.viewing
      ? "v2.partners.form.detail"
      : "v2.partners.form.edit";
  const title = t(titleKey, { defaultValue: type, type });

  return (
    <V2StandardDrawer
      id={`business-partner-${props.partnerId ?? "new"}`}
      open={props.open}
      onClose={props.onClose}
      mode={state.creating ? "edit" : state.mode}
      onToggleEdit={
        state.viewing && props.canUpdate
          ? () => state.setMode("edit")
          : undefined
      }
      title={title}
      subtitle={state.form.name || state.form.code}
      titleExtra={
        !state.creating ? (
          <BusinessPartnerStatusBadge status={state.form.status} />
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
      <BusinessPartnerFormSections
        form={state.form}
        viewing={state.viewing}
        codeEditable={state.codeEditable}
        nameError={state.nameError}
        t={t}
        setField={state.setField}
        onRegenerateCode={state.regenerateCode}
      />
    </V2StandardDrawer>
  );
}
