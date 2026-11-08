import * as React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { useRemoveRoleMutation } from "../api/mutations/useRoleMutations";
import { buildRolesColumns } from "../components/organisms/role-table/RoleTable.columns";
import { rolesViewVisibility } from "../components/organisms/role-table/RoleTable.views";
import type { Role } from "../domain/entities/role";

const TABLE_ID = "permission-table";

export function useRolesPage() {
  const { t } = useV2Translation();
  const canCreate = useV2HasPermission({
    collection: "admin_users",
    action: "create",
  });
  const canUpdate = useV2HasPermission({
    collection: "admin_users",
    action: "update",
  });
  const canDelete = useV2HasPermission({
    collection: "admin_users",
    action: "delete",
  });
  const [drawer, setDrawer] = React.useState<{
    id: string | null;
    mode: "view" | "edit";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Role | null>(null);
  const [view, setView] = React.useState(
    () =>
      useV2TablePreferencesStore.getState().tables[TABLE_ID]?.views
        ?.activeKey ?? "overview",
  );
  const [tableKey, setTableKey] = React.useState(0);

  React.useEffect(() => {
    if (!useV2TablePreferencesStore.getState().tables[TABLE_ID]?.columns) {
      applyV2SystemView(TABLE_ID, "overview", rolesViewVisibility.overview);
    }
  }, []);

  const onListError = React.useCallback(
    (error: unknown) => {
      const fallback = t(
        "v2.rbacRoles.listLoadError",
        "Không thể tải danh sách vai trò",
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
    () => buildRolesColumns(t, (id) => open(id, "view")),
    [t, open],
  );

  const rowActions = React.useCallback(
    (row: Role): V2RowActionGroup[] => {
      const groups: V2RowActionGroup[] = [];

      const queryItems: V2RowActionGroup["items"] = [
        {
          label: t("v2.rbacRoles.actions.view", "Xem chi tiết"),
          icon: <Eye className="h-3.5 w-3.5" />,
          onClick: () => open(row.id, "view"),
        },
      ];
      groups.push({
        groupLabel: t("v2.rbacRoles.actionGroups.query", "Tra cứu"),
        items: queryItems,
      });

      const actionItems: V2RowActionGroup["items"] = [];
      if (canUpdate) {
        actionItems.push({
          label: t("v2.rbacRoles.actions.edit", "Chỉnh sửa"),
          icon: <Pencil className="h-3.5 w-3.5" />,
          onClick: () => open(row.id, "edit"),
        });
      }
      if (canDelete && !row.isSystem) {
        actionItems.push({
          label: t("v2.rbacRoles.actions.delete", "Xóa"),
          icon: <Trash2 className="h-3.5 w-3.5" />,
          variant: "danger",
          onClick: () => setDeleteTarget(row),
        });
      }
      if (actionItems.length > 0) {
        groups.push({
          groupLabel: t("v2.rbacRoles.actionGroups.actions", "Thao tác"),
          items: actionItems,
        });
      }

      return groups;
    },
    [canDelete, canUpdate, open, t],
  );

  const remove = useRemoveRoleMutation(t, () => setDeleteTarget(null));

  const selectView = (key: string) => {
    setView(key);
    const visibility =
      rolesViewVisibility[key as keyof typeof rolesViewVisibility];
    if (visibility) {
      applyV2SystemView(TABLE_ID, key, visibility);
      setTableKey((value) => value + 1);
    }
  };

  return {
    t,
    tableId: TABLE_ID,
    tableKey,
    columns,
    rowActions,
    canCreate,
    canUpdate,
    canDelete,
    drawer,
    setDrawer,
    open,
    deleteTarget,
    setDeleteTarget,
    remove,
    view,
    selectView,
    onListError,
  };
}

export type RolesPageState = ReturnType<typeof useRolesPage>;
