import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { V2DrawerHistoryTab } from "@/v2/shared/components/molecules/v2-drawer-history-tab";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { RoleFormSections } from "../components/organisms/role-form";
import { RolePermissionsMatrix } from "../components/organisms/role-permissions-matrix";
import { RoleUsersSection } from "../components/organisms/role-users-section";
import type { RoleDrawerProps } from "./RoleDrawer.hook";
import { useRoleDrawer } from "./RoleDrawer.hook";

export function RoleDrawer(props: RoleDrawerProps) {
  const { t } = useV2Translation();
  const state = useRoleDrawer(props);

  const title = state.creating
    ? t("v2.rbacRoles.form.create", "Thêm vai trò mới")
    : state.viewing
      ? t("v2.rbacRoles.form.detail", "Chi tiết vai trò")
      : t("v2.rbacRoles.form.edit", "Chỉnh sửa vai trò");

  const drawerTabs = [
    {
      key: "permissions",
      label: t("v2.rbacRoles.tabs.permissions", "Phân quyền"),
      hideRightPanel: false,
    },
    {
      key: "history",
      label: t("v2.rbacRoles.tabs.history", "Lịch sử"),
      hideRightPanel: true,
    },
  ];

  return (
    <V2StandardDrawer
      id={`role-${props.recordId ?? "new"}`}
      open={props.open}
      onClose={props.onClose}
      mode={state.creating ? "edit" : state.mode}
      onToggleEdit={
        state.viewing && props.canUpdate
          ? () => state.setMode("edit")
          : undefined
      }
      title={title}
      subtitle={state.form.name || undefined}
      layout="2-columns"
      size="xl"
      loading={state.loading}
      confirmOnClose={state.dirty && !state.viewing}
      tabs={drawerTabs}
      activeTabKey={state.activeTab}
      onTabChange={state.setActiveTab}
      rightPanel={
        state.activeTab === "permissions" ? (
          <div className="flex flex-col w-full">
            <RoleFormSections
              form={state.form}
              viewing={state.viewing}
              errorField={state.errorField}
              errorMessage={t(
                "v2.rbacRoles.form.required",
                "Trường này là bắt buộc",
              )}
              t={t}
              setField={state.setField}
            />
            <RoleUsersSection
              viewing={state.viewing}
              loading={state.loading}
              selectedUserIds={state.selectedUserIds}
              allUsers={state.allUsers}
              onUsersChange={state.setSelectedUserIds}
              t={t}
            />
          </div>
        ) : undefined
      }
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
      {state.activeTab === "permissions" ? (
        <RolePermissionsMatrix
          permMap={state.permMap}
          setPermMap={state.setPermMap}
          resources={state.resources}
          loading={state.loading}
          error={null}
          isView={state.viewing}
          isWildcard={state.isWildcard}
          onReload={state.reload}
          t={t}
        />
      ) : (
        <V2DrawerHistoryTab
          items={state.historyItems}
          loading={state.loading}
          title={t("v2.rbacRoles.history.title", "Lịch sử thay đổi vai trò")}
          emptyMessage={t(
            "v2.rbacRoles.history.empty",
            "Chưa có bản ghi lịch sử nào",
          )}
        />
      )}
    </V2StandardDrawer>
  );
}
