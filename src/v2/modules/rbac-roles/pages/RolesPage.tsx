import * as React from "react";
import { Shield } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { V2ModulePage } from "@/v2/shared/components/templates/v2-module-page";
import type { V2ModuleTab } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { useRolesQuery } from "../api/queries/useRolesQuery";
import { RoleDrawer } from "../drawers/RoleDrawer";
import type { Role } from "../domain/entities/role";
import { useRolesPage } from "./useRolesPage";
import "../rbacRoles.locale";

export function RolesPage() {
  const state = useRolesPage();
  const { t } = state;

  const tabs = React.useMemo<V2ModuleTab<Role>[]>(
    () => [
      {
        key: "list",
        label: t("v2.rbacRoles.list", "Danh sách"),
        kind: "list",
        resetKey: `${state.tableId}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: (params) =>
            import("../api/rolesApi").then(({ rolesV2Api }) =>
              rolesV2Api.options(params),
            ),
          rowActions: state.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.rbacRoles.empty", "Không có dữ liệu vai trò"),
          toolbar: {
            search: {},
            filterPanel: {},
            enableFullscreen: true,
            viewModes: {
              items: [
                {
                  key: "overview",
                  label: t("v2.rbacRoles.views.overview", "Tổng quan"),
                },
                {
                  key: "all",
                  label: t("v2.rbacRoles.views.all", "Tất cả cột"),
                },
              ],
              activeKey: state.view,
              onSelect: state.selectView,
            },
          },
        },
        useData: (query) => useRolesQuery(query, state.onListError),
      },
    ],
    [state],
  );

  return (
    <V2ModulePage<Role>
      title={t("v2.rbacRoles.title", "Phân quyền & Vai trò")}
      description={t(
        "v2.rbacRoles.description",
        "Quản lý vai trò và phân quyền truy cập trong hệ thống",
      )}
      icon={<Shield className="h-5 w-5" />}
      tabs={tabs}
      actions={
        state.canCreate ? (
          <V2Button size="sm" onClick={() => state.open(null, "edit")}>
            {t("v2.rbacRoles.create", "Thêm vai trò")}
          </V2Button>
        ) : undefined
      }
      overlays={
        <>
          {state.drawer && (
            <RoleDrawer
              open
              recordId={state.drawer.id}
              mode={state.drawer.mode}
              canUpdate={state.canUpdate}
              onClose={() => state.setDrawer(null)}
            />
          )}
          <V2ConfirmModal
            open={Boolean(state.deleteTarget)}
            title={t("v2.rbacRoles.delete.title", "Xác nhận xóa vai trò")}
            message={
              state.deleteTarget
                ? `${t("v2.rbacRoles.delete.message", "Bạn có chắc muốn xóa vai trò")} "${state.deleteTarget.name}"? ${t("v2.rbacRoles.delete.irreversible", "Hành động này không thể hoàn tác.")}`
                : ""
            }
            confirmLabel={t("v2.rbacRoles.actions.delete", "Xóa")}
            cancelLabel={t("v2.common.cancel", "Hủy")}
            variant="danger"
            isLoading={state.remove.isPending}
            onConfirm={() => {
              if (state.deleteTarget)
                state.remove.mutate(state.deleteTarget.id);
            }}
            onCancel={() => state.setDeleteTarget(null)}
            onOpenChange={(open) => !open && state.setDeleteTarget(null)}
          />
        </>
      }
    />
  );
}
