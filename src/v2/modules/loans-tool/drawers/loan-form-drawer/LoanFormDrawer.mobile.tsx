import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2StandardDrawer,
  type DrawerAction,
} from "@/v2/shared/components/organisms/v2-standard-drawer";
import { LoanFormDrawerProps } from "./LoanFormDrawer.type";
import { useLoanFormDrawer } from "./LoanFormDrawer.hook";
import { LoanFormFields } from "./LoanFormFields";

export const LoanFormDrawerMobile: React.FC<LoanFormDrawerProps> = (props) => {
  const { t } = useV2Translation();
  const { values, errors, handleChange, handleSubmit, isSubmitting, isEdit } =
    useLoanFormDrawer(props);

  const title = isEdit
    ? t("v2.loans.drawer.editTitle", "Cập Nhật Hợp Đồng Vay")
    : t("v2.loans.drawer.createTitle", "Tạo Hợp Đồng Vay Mới");

  const actions: DrawerAction[] = [
    {
      label: t("v2.common.cancel", "Hủy"),
      variant: "outline",
      onClick: props.onClose,
      disabled: isSubmitting,
    },
    {
      label: t("v2.common.save", "Lưu"),
      variant: "primary",
      onClick: () => {
        void handleSubmit();
      },
      loading: isSubmitting,
    },
  ];

  return (
    <V2StandardDrawer
      id={`loan-form-m-${props.record?.id ?? "new"}`}
      open={props.open}
      onClose={props.onClose}
      title={title}
      size="full"
      mode="edit"
      layout="1-column"
      actions={actions}
    >
      <LoanFormFields
        values={values}
        errors={errors}
        handleChange={handleChange}
        isMobile
      />
    </V2StandardDrawer>
  );
};
LoanFormDrawerMobile.displayName = "LoanFormDrawerMobile";
