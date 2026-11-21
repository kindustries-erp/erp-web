import { V2StandardDrawer } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { EmployeeStatusBadge } from "../components/molecules/employee-status-badge";
import {
  EmployeeAccountSection,
  EmployeeProfileSection,
  EmployeeWorkSection,
} from "../components/organisms/employee-form";
import type { EmployeeDrawerProps } from "./EmployeeDrawer.type";
import { useEmployeeDrawer } from "./EmployeeDrawer.hook";

export function EmployeeDrawer(props: EmployeeDrawerProps) {
  const { t } = useV2Translation();
  const state = useEmployeeDrawer(props);

  const title = state.creating
    ? t("v2.employees.form.create", "Thêm nhân viên")
    : state.viewing
      ? t("v2.employees.form.detail", "Chi tiết nhân viên")
      : t("v2.employees.form.edit", "Sửa nhân viên");

  const formProps = {
    form: state.form,
    viewing: state.viewing,
    creating: state.creating,
    error: state.error,
    branchOptions: state.branchOptions,
    branchLoading: state.branchLoading,
    branchFallbackLabel: state.branchFallbackLabel,
    nationalIdMasked: state.nationalIdMasked,
    linkedUserEmail: state.linkedUserEmail,
    t,
    setField: state.setField,
  };

  return (
    <V2StandardDrawer
      id={`employee-${props.recordId ?? "new"}`}
      open={props.open}
      onClose={props.onClose}
      mode={state.creating ? "edit" : state.mode}
      onToggleEdit={
        state.viewing && props.canUpdate
          ? () => state.setMode("edit")
          : undefined
      }
      title={title}
      subtitle={state.form.fullName}
      titleExtra={
        !state.creating ? (
          <EmployeeStatusBadge status={state.form.status} />
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
      <div className="space-y-3">
        <EmployeeProfileSection {...formProps} />
        <EmployeeWorkSection {...formProps} />
        {!state.creating && (
          <EmployeeAccountSection
            linkedUserEmail={state.linkedUserEmail}
            t={t}
          />
        )}
      </div>
    </V2StandardDrawer>
  );
}
