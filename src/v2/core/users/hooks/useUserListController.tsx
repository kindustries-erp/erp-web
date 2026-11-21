import * as React from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type { UserModuleConfig } from "../users.config.type";
import {
  useResetUserPasswordMutation,
  useToggleUserStatusMutation,
} from "../api/mutations/useUserMutations";
import { buildUserColumns } from "../components/organisms/user-table";
import type { UserRecord } from "../domain/user";
import { buildUserRowActions } from "./userRowActions";

export interface UserDrawerTarget {
  id: string | null;
  mode: "view" | "edit";
}

/**
 * Controller hook của màn danh sách tài khoản: phân quyền, drawer, đổi trạng thái,
 * đặt lại mật khẩu, view modes, columns và row actions.
 */
export function useUserListController(config: UserModuleConfig) {
  const { t } = useV2Translation();
  const { tableId, viewVisibility, permissionCollection, api, keys } = config;

  const canManage = useV2HasPermission({
    collection: permissionCollection,
    action: "manage",
  });

  const [drawer, setDrawer] = React.useState<UserDrawerTarget | null>(null);
  const [statusTarget, setStatusTarget] = React.useState<UserRecord | null>(
    null,
  );
  const [resetTarget, setResetTarget] = React.useState<UserRecord | null>(null);
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

  const onListError = React.useCallback(
    (error: unknown) => {
      const fallback = t(
        "v2.users.listLoadError",
        "Không thể tải danh sách tài khoản",
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
    () => buildUserColumns(t, (id) => open(id, "view")),
    [t, open],
  );

  const [impersonateTarget, setImpersonateTarget] =
    React.useState<UserRecord | null>(null);
  const canImpersonate = useAuthStore((state) => state.canImpersonate);
  const impersonateAction = useAuthStore((state) => state.impersonateAction);
  const [impersonating, setImpersonating] = React.useState(false);

  const confirmImpersonate = React.useCallback(async () => {
    if (!impersonateTarget) return;
    setImpersonating(true);
    try {
      await impersonateAction(impersonateTarget.id);
      setImpersonateTarget(null);
    } catch (error) {
      const fallback = t(
        "v2.users.impersonate.error",
        "Không đăng nhập dưới quyền được",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    } finally {
      setImpersonating(false);
    }
  }, [impersonateAction, impersonateTarget, t]);

  const rowActions = React.useCallback(
    (row: UserRecord): V2RowActionGroup[] =>
      buildUserRowActions(row, {
        t,
        canManage,
        canImpersonate,
        onOpen: open,
        onToggleStatus: setStatusTarget,
        onResetPassword: setResetTarget,
        onImpersonate: setImpersonateTarget,
      }),
    [canImpersonate, canManage, open, t],
  );

  const toggleStatus = useToggleUserStatusMutation(
    t,
    () => setStatusTarget(null),
    { api, keys },
  );
  const resetPassword = useResetUserPasswordMutation(
    t,
    () => setResetTarget(null),
    { api, keys },
  );

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
    canCreate: canManage,
    canUpdate: canManage,
    drawer,
    setDrawer,
    open,
    statusTarget,
    setStatusTarget,
    toggleStatus,
    resetTarget,
    setResetTarget,
    resetPassword,
    impersonateTarget,
    setImpersonateTarget,
    impersonating,
    confirmImpersonate,
    view,
    selectView,
    onListError,
  };
}

export type UserListControllerState = ReturnType<typeof useUserListController>;
