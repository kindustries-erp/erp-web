import * as React from "react";
import { Plus, Users } from "lucide-react";
import { V2Button, V2ConfirmModal, V2ModulePage } from "@/v2/shared/components";
import type { V2ModuleTab } from "@/v2/shared/components";
import {
  isUserInactive,
  useUsersQuery,
  UserDrawer,
  UserResetPasswordModal,
} from "@/v2/core/users";
import type { UserRecord } from "@/v2/core/users";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { usersManagementConfig } from "../usersManagement.config";
import { useUsersManagementPage } from "./UsersManagementPage.hook";
import "../usersManagement.locale";

/** Màn Quản lý tài khoản: bố cục và nối lõi; dữ liệu và thao tác lấy từ hook của lõi */
export function UsersManagementPage() {
  const state = useUsersManagementPage();
  const { t } = state;

  const tabs = React.useMemo<V2ModuleTab<UserRecord>[]>(
    () => [
      {
        key: "list",
        label: t("v2.usersManagement.list", "Danh sách"),
        kind: "list",
        resetKey: `${state.tableId}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: (params) => usersManagementConfig.api.options(params),
          rowActions: state.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.usersManagement.empty", "Chưa có dữ liệu"),
          toolbar: {
            search: {},
            filterPanel: {},
            enableFullscreen: true,
            viewModes: {
              items: [
                {
                  key: "overview",
                  label: t("v2.common.overview", "Tổng quan"),
                },
                { key: "all", label: t("v2.users.views.all", "Tất cả cột") },
              ],
              activeKey: state.view,
              onSelect: state.selectView,
            },
          },
        },
        useData: (query) =>
          useUsersQuery({
            api: usersManagementConfig.api,
            keys: usersManagementConfig.keys,
            query,
            onError: state.onListError,
          }),
      },
    ],
    [state, t],
  );

  return (
    <V2ModulePage<UserRecord>
      title={t("v2.usersManagement.title", "Quản lý tài khoản")}
      description={t(
        "v2.usersManagement.description",
        "Quản lý tài khoản đăng nhập, liên kết nhân viên và trạng thái",
      )}
      icon={<Users className="h-4 w-4" />}
      tabs={tabs}
      actions={
        state.canCreate ? (
          <V2Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => state.open(null, "edit")}
          >
            {t("v2.usersManagement.create", "Thêm tài khoản")}
          </V2Button>
        ) : undefined
      }
      overlays={
        <>
          {state.drawer && (
            <UserDrawer
              key={`${state.drawer.id ?? "new"}-${state.drawer.mode}`}
              config={usersManagementConfig}
              open
              recordId={state.drawer.id}
              mode={state.drawer.mode}
              canUpdate={state.canUpdate}
              onClose={() => state.setDrawer(null)}
            />
          )}
          <V2ConfirmModal
            open={Boolean(state.statusTarget)}
            title={
              state.statusTarget && isUserInactive(state.statusTarget.status)
                ? t("v2.users.actions.activate", "Kích hoạt")
                : t("v2.users.actions.deactivate", "Ngưng hoạt động")
            }
            message={
              state.statusTarget && isUserInactive(state.statusTarget.status)
                ? t(
                    "v2.users.status.confirmActivate",
                    "Kích hoạt tài khoản này?",
                  )
                : t(
                    "v2.users.status.confirmDeactivate",
                    "Ngưng hoạt động tài khoản này?",
                  )
            }
            confirmLabel={t("v2.users.actions.confirm", "Xác nhận")}
            cancelLabel={t("v2.common.cancel", "Hủy")}
            variant={
              state.statusTarget && isUserInactive(state.statusTarget.status)
                ? "primary"
                : "danger"
            }
            isLoading={state.toggleStatus.isPending}
            onConfirm={() => {
              if (state.statusTarget)
                state.toggleStatus.mutate({
                  id: state.statusTarget.id,
                  active: isUserInactive(state.statusTarget.status),
                });
            }}
            onCancel={() => state.setStatusTarget(null)}
            onOpenChange={(open) => !open && state.setStatusTarget(null)}
          />
          <UserResetPasswordModal
            open={Boolean(state.resetTarget)}
            email={state.resetTarget?.email ?? ""}
            loading={state.resetPassword.isPending}
            t={t}
            onSubmit={(password) => {
              if (state.resetTarget)
                state.resetPassword.mutate({
                  id: state.resetTarget.id,
                  password,
                });
            }}
            onCancel={() => state.setResetTarget(null)}
          />
        </>
      }
    />
  );
}
