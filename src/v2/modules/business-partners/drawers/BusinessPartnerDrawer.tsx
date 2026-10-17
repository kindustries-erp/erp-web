import { Badge } from "@/v2/shared/ui";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { businessPartnersV2Api } from "../api/businessPartnersApi";
import type { BusinessPartnerDrawerState } from "./BusinessPartnerDrawer.hook";
import { useBusinessPartnerDrawer } from "./BusinessPartnerDrawer.hook";
import { BusinessPartnerFormSections } from "./BusinessPartnerFormSections";

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

  const regenerateCode = () => {
    void businessPartnersV2Api
      .nextCode(props.partnerType)
      .then(({ nextCode }) => state.setField("code", nextCode));
  };

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
          <Badge
            variant={state.form.status === "ACTIVE" ? "default" : "secondary"}
          >
            {state.form.status === "ACTIVE"
              ? t("v2.partners.status.active", "Hoạt động")
              : t("v2.partners.status.inactive", "Ngưng hoạt động")}
          </Badge>
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
        nameError={state.nameError}
        t={t}
        setField={state.setField}
        onRegenerateCode={regenerateCode}
      />
    </V2StandardDrawer>
  );
}
