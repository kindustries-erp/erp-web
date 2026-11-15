import * as React from "react";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type { EmployeeModuleConfig } from "../employees.config.type";
import {
  useDeleteEmployeeMutation,
  useToggleEmployeeStatusMutation,
} from "../api/mutations/useEmployeeMutations";
import { useEmployeeBranchOptionsQuery } from "../api/queries/useEmployeeBranchOptionsQuery";
import { buildEmployeeColumns } from "../components/organisms/employee-table";
import type { EmployeeRecord } from "../domain/employee";
import { buildEmployeeRowActions } from "./employeeRowActions";

export interface EmployeeDrawerTarget {
  id: string | null;
  mode: "view" | "edit";
}

/**
 * Controller hook của màn danh sách nhân viên: phân quyền theo từng hành động,
 * drawer, đổi trạng thái, xóa mềm, view modes, columns và row actions.
 */
export function useEmployeeListController(config: EmployeeModuleConfig) {
  const { t } = useV2Translation();
  const { tableId, viewVisibility, permissionCollection, api, keys } = config;

  const canCreate = useV2HasPermission({
    collection: permissionCollection,
    action: "create",
  });
  const canUpdate = useV2HasPermission({
    collection: permissionCollection,
    action: "update",
  });
  const canDelete = useV2HasPermission({
    collection: permissionCollection,
    action: "delete",
  });

  const [drawer, setDrawer] = React.useState<EmployeeDrawerTarget | null>(null);
  const [statusTarget, setStatusTarget] = React.useState<EmployeeRecord | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = React.useState<EmployeeRecord | null>(
    null,
  );
  const [view, setView] = React.useState(
    () =>
      useV2TablePreferencesStore.getState().tables[tableId]?.views?.activeKey ??
      "overview",
  );
  const [tableKey, setTableKey] = React.useState(0);

  React.useEffect(() => {
    if (!useV2TablePreferencesStore.getState().tables[tableId]?.columns) {
      applyV2SystemView(tableId, "overview", viewVisibility.overview);
    }
  }, [tableId, viewVisibility]);

  const branches = useEmployeeBranchOptionsQuery(api, keys);
  const branchOptions = React.useMemo(
    () =>
      (branches.data ?? []).map((b) => ({
        value: b.id,
        label: `${b.code} · ${b.name}`,
      })),
    [branches.data],
  );

  const onListError = React.useCallback(
    (error: unknown) => {
      const fallback = t(
        "v2.employees.listLoadError",
        "Không thể tải danh sách nhân viên",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
    [t],
  );

  const open = React.useCallback(
    (id: string | null, mode: "view" | "edit") => setDrawer({ id, mode }),
    [],
  );

  const columns = React.useMemo(
    () =>
      buildEmployeeColumns(t, {
        openDetail: (id) => open(id, "view"),
        branchOptions,
      }),
    [t, open, branchOptions],
  );

  const rowActions = React.useCallback(
    (row: EmployeeRecord) =>
      buildEmployeeRowActions(row, {
        t,
        canUpdate,
        canDelete,
        onOpen: open,
        onToggleStatus: setStatusTarget,
        onDelete: setDeleteTarget,
      }),
    [canUpdate, canDelete, open, t],
  );

  const toggleStatus = useToggleEmployeeStatusMutation(
    t,
    () => setStatusTarget(null),
    { api, keys },
  );
  const remove = useDeleteEmployeeMutation(t, () => setDeleteTarget(null), {
    api,
    keys,
  });

  const selectView = React.useCallback(
    (key: string) => {
      const visibility = viewVisibility[key];
      setView(key);
      if (visibility) {
        applyV2SystemView(tableId, key, visibility);
        setTableKey((value) => value + 1);
      }
    },
    [tableId, viewVisibility],
  );

  return {
    t,
    tableId,
    tableKey,
    columns,
    rowActions,
    canCreate,
    canUpdate,
    drawer,
    setDrawer,
    open,
    statusTarget,
    setStatusTarget,
    toggleStatus,
    deleteTarget,
    setDeleteTarget,
    remove,
    view,
    selectView,
    onListError,
  };
}

export type EmployeeListControllerState = ReturnType<
  typeof useEmployeeListController
>;
