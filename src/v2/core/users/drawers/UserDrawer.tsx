import { V2StandardDrawer } from "@/v2/shared/components";
import { V2DrawerHistoryTab } from "@/v2/shared/components/molecules/v2-drawer-history-tab";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { UserStatusBadge } from "../components/molecules/user-status-badge";
import { UserFormSections } from "../components/organisms/user-form";
import type { UserDrawerProps } from "./UserDrawer.type";
import { useUserDrawer } from "./UserDrawer.hook";

export function UserDrawer(props: UserDrawerProps) {
  const { t } = useV2Translation();
  const state = useUserDrawer(props);

  const title = state.creating
    ? t("v2.users.form.create", "Tạo tài khoản")
    : state.viewing
      ? t("v2.users.form.detail", "Chi tiết tài khoản")
      : t("v2.users.form.edit", "Sửa tài khoản");

  const drawerTabs = state.creating
    ? undefined
    : [
        {
          key: "info",
          label: t("v2.users.form.detail", "Chi tiết tài khoản"),
          hideRightPanel: true,
        },
        {
          key: "history",
          label: t("v2.users.history.tab", "Lịch sử"),
          hideRightPanel: true,
        },
      ];
  const showHistory = !state.creating && state.activeTab === "history";

  return (
    <V2StandardDrawer
      id={`user-${props.recordId ?? "new"}`}
      open={props.open}
      onClose={props.onClose}
      mode={state.creating ? "edit" : state.mode}
      onToggleEdit={
        state.viewing && props.canUpdate
          ? () => state.setMode("edit")
          : undefined
      }
      title={title}
      subtitle={state.form.email}
      titleExtra={
        !state.creating ? (
          <UserStatusBadge status={state.form.status} />
        ) : undefined
      }
      layout="1-column"
      tabs={drawerTabs}
      activeTabKey={state.activeTab}
      onTabChange={state.setActiveTab}
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
      {showHistory ? (
        <V2DrawerHistoryTab
          items={state.historyItems}
          loading={state.historyLoading}
          title={t("v2.users.history.title", "Nhật ký thao tác tài khoản")}
          emptyMessage={
            state.historyError
              ? t("v2.users.history.loadError", "Không thể tải nhật ký")
              : t("v2.users.history.empty", "Chưa có nhật ký")
          }
        />
      ) : (
        <UserFormSections
          form={state.form}
          viewing={state.viewing}
          creating={state.creating}
          emailEditable={state.emailEditable}
          emailError={state.emailError}
          passwordError={state.passwordError}
          employeeOptions={state.employeeOptions}
          employeeLoading={state.employeeLoading}
          employeeFallbackLabel={state.employeeFallbackLabel}
          t={t}
          setField={state.setField}
        />
      )}
    </V2StandardDrawer>
  );
}
