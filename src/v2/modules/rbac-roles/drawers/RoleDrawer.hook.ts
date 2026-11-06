import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type { DrawerAuditItem } from "@/v2/shared/components/molecules/v2-drawer-history-tab";
import { rolesV2Api } from "../api/rolesApi";
import { rolesKeys } from "../api/queries/rolesKeys";
import {
  emptyRoleForm,
  type Role,
  type RoleFormValue,
} from "../domain/entities/role";
import type {
  PermissionMap,
  ResourceItem,
} from "../domain/entities/permission";
import { isRoleFormDirty, validateRoleForm } from "../domain/rules/roleRules";
import type { SystemUserOption } from "../components/organisms/role-users-section";
import {
  EMPTY_ROLE_PERMISSION_META,
  buildInitialPermissionMap,
  buildRoleHistoryItems,
  extractRolePermissionMeta,
  serializePermissionsMap,
  type RolePermissionMeta,
} from "./RoleDrawer.helper";

export interface RoleDrawerProps {
  open: boolean;
  recordId: string | null;
  mode: "view" | "edit";
  canUpdate: boolean;
  onClose: () => void;
}

export function useRoleDrawer(props: RoleDrawerProps) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const [mode, setMode] = React.useState(props.mode);
  const [activeTab, setActiveTab] = React.useState<string>("permissions");
  const [roleDetail, setRoleDetail] = React.useState<Role | null>(null);
  const [form, setForm] = React.useState<RoleFormValue>(emptyRoleForm);
  const [initialForm, setInitialForm] =
    React.useState<RoleFormValue>(emptyRoleForm);
  const [permMap, setPermMap] = React.useState<PermissionMap>({});
  const [permMeta, setPermMeta] = React.useState<RolePermissionMeta>(
    EMPTY_ROLE_PERMISSION_META,
  );
  const [resources, setResources] = React.useState<ResourceItem[]>([]);
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
  const [allUsers, setAllUsers] = React.useState<SystemUserOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [errorField, setErrorField] = React.useState<string | null>(null);

  const creating = !props.recordId;
  const viewing = mode === "view" && !creating;

  React.useEffect(() => setMode(props.mode), [props.mode, props.open]);

  const loadData = React.useCallback(async () => {
    if (!props.open) return;
    setLoading(true);
    try {
      const [resResult, userResult] = await Promise.allSettled([
        rolesV2Api.getResources(),
        rolesV2Api.getAllUsers(),
      ]);
      const resList = resResult.status === "fulfilled" ? resResult.value : [];
      const userList =
        userResult.status === "fulfilled" ? userResult.value : [];
      setResources(resList);
      setAllUsers(userList);

      if (props.recordId) {
        const [detailResult, permsResult, usersResult] =
          await Promise.allSettled([
            rolesV2Api.get(props.recordId),
            rolesV2Api.getPermissions(props.recordId),
            rolesV2Api.getUsers(props.recordId),
          ]);
        if (detailResult.status === "fulfilled") {
          setRoleDetail(detailResult.value);
          const nextForm: RoleFormValue = {
            name: detailResult.value.name ?? "",
            description: detailResult.value.description ?? "",
          };
          setForm(nextForm);
          setInitialForm(nextForm);
        }
        const rolePerms =
          permsResult.status === "fulfilled" ? permsResult.value : [];
        setPermMap(buildInitialPermissionMap(resList, rolePerms));
        setPermMeta(extractRolePermissionMeta(resList, rolePerms));

        if (usersResult.status === "fulfilled") {
          setSelectedUserIds(usersResult.value.map((u) => u.id));
        }
      } else {
        setRoleDetail(null);
        const fresh = emptyRoleForm();
        setForm(fresh);
        setInitialForm(fresh);
        setPermMap(buildInitialPermissionMap(resList, []));
        setPermMeta(EMPTY_ROLE_PERMISSION_META);
        setSelectedUserIds([]);
      }
    } finally {
      setLoading(false);
    }
  }, [props.open, props.recordId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const setField = <K extends keyof RoleFormValue>(
    key: K,
    val: RoleFormValue[K],
  ) => setForm((prev) => ({ ...prev, [key]: val }));

  const submit = async () => {
    const missing = validateRoleForm(form);
    if (missing) {
      setErrorField(missing);
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t("v2.rbacRoles.form.missingInfo", "Thiếu thông tin"),
        description: t("v2.rbacRoles.form.required", "Tên vai trò là bắt buộc"),
      });
      return;
    }
    setErrorField(null);
    setSaving(true);
    try {
      let roleId = props.recordId;
      if (roleId) {
        await rolesV2Api.update(roleId, form);
      } else {
        const created = await rolesV2Api.create(form);
        roleId = created.id;
      }
      if (roleId) {
        await Promise.all([
          rolesV2Api.savePermissions(
            roleId,
            serializePermissionsMap(permMap, permMeta),
          ),
          rolesV2Api.saveUsers(roleId, selectedUserIds),
        ]);
      }
      await queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t("v2.rbacRoles.form.saveSuccess", "Đã lưu thành công"),
      });
      props.onClose();
    } catch (e) {
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t("v2.rbacRoles.form.saveError", "Không thể lưu dữ liệu"),
        description: extractV2ApiError(e, "Lỗi lưu dữ liệu"),
      });
    } finally {
      setSaving(false);
    }
  };

  const historyItems = React.useMemo<DrawerAuditItem[]>(
    () => buildRoleHistoryItems(roleDetail, form.name),
    [roleDetail, form.name],
  );

  return {
    mode,
    setMode,
    activeTab,
    setActiveTab,
    form,
    setField,
    permMap,
    setPermMap,
    isWildcard: permMeta.isWildcard,
    resources,
    selectedUserIds,
    setSelectedUserIds,
    allUsers,
    loading,
    saving,
    errorField,
    creating,
    viewing,
    dirty: isRoleFormDirty(form, initialForm),
    historyItems,
    reload: loadData,
    submit,
  };
}
