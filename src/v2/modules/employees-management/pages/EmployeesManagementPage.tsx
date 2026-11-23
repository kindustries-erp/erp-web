import * as React from "react";
import { Plus, UserRound } from "lucide-react";
import { V2Button, V2ConfirmModal, V2ModulePage } from "@/v2/shared/components";
import type { V2ModuleTab } from "@/v2/shared/components";
import {
  EmployeeDrawer,
  isEmployeeInactive,
  useEmployeesQuery,
} from "@/v2/core/employees";
import type { EmployeeRecord } from "@/v2/core/employees";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { employeesManagementConfig } from "../employeesManagement.config";
import { useEmployeesManagementPage } from "./EmployeesManagementPage.hook";
import "../employeesManagement.locale";

/** Màn Quản lý nhân viên: bố cục và nối lõi; dữ liệu và thao tác lấy từ hook của lõi */
export function EmployeesManagementPage() {
  const state = useEmployeesManagementPage();
  const { t } = state;
  const activating = state.statusTarget
    ? isEmployeeInactive(state.statusTarget.status)
    : false;

  const tabs = React.useMemo<V2ModuleTab<EmployeeRecord>[]>(
    () => [
      {
        key: "list",
        label: t("v2.employeesManagement.list", "Danh sách"),
        kind: "list",
        resetKey: `${state.tableId}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: (params) =>
            employeesManagementConfig.api.options(params),
          rowActions: state.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.employeesManagement.empty", "Chưa có nhân viên"),
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
                {
                  key: "all",
                  label: t("v2.employees.views.all", "Tất cả cột"),
                },
              ],
              activeKey: state.view,
              onSelect: state.selectView,
            },
          },
        },
        useData: (query) =>
          useEmployeesQuery({
            api: employeesManagementConfig.api,
            keys: employeesManagementConfig.keys,
            query,
            onError: state.onListError,
          }),
      },
    ],
    [state, t],
  );

  return (
    <V2ModulePage<EmployeeRecord>
      title={t("v2.employeesManagement.title", "Quản lý nhân viên")}
      description={t(
        "v2.employeesManagement.description",
        "Hồ sơ nhân viên, chức danh, phòng ban, chi nhánh và trạng thái",
      )}
      icon={<UserRound className="h-4 w-4" />}
      tabs={tabs}
      actions={
        state.canCreate ? (
          <V2Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => state.open(null, "edit")}
          >
            {t("v2.employeesManagement.create", "Thêm nhân viên")}
          </V2Button>
        ) : undefined
      }
      overlays={
        <>
          {state.drawer && (
            <EmployeeDrawer
              key={`${state.drawer.id ?? "new"}-${state.drawer.mode}`}
              config={employeesManagementConfig}
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
              activating
                ? t("v2.employees.actions.activate", "Chuyển sang đang làm")
                : t("v2.employees.actions.deactivate", "Chuyển sang nghỉ việc")
            }
            message={
              activating
                ? t(
                    "v2.employees.status.confirmActivate",
                    "Chuyển nhân viên này sang đang làm?",
                  )
                : t(
                    "v2.employees.status.confirmDeactivate",
                    "Chuyển nhân viên này sang nghỉ việc?",
                  )
            }
            confirmLabel={t("v2.employees.actions.confirm", "Xác nhận")}
            cancelLabel={t("v2.common.cancel", "Hủy")}
            variant={activating ? "primary" : "danger"}
            isLoading={state.toggleStatus.isPending}
            onConfirm={() => {
              if (state.statusTarget)
                state.toggleStatus.mutate({
                  id: state.statusTarget.id,
                  active: activating,
                });
            }}
            onCancel={() => state.setStatusTarget(null)}
            onOpenChange={(open) => !open && state.setStatusTarget(null)}
          />
          <V2ConfirmModal
            open={Boolean(state.deleteTarget)}
            title={t("v2.employees.delete.title", "Xóa nhân viên")}
            message={t(
              "v2.employees.delete.message",
              "Xóa nhân viên này? Dữ liệu được ẩn khỏi danh sách.",
            )}
            confirmLabel={t("v2.employees.actions.delete", "Xóa")}
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
