import * as React from "react";
import { PERMISSION_RESOURCE_GROUPS } from "@/modules/system/types/rbac";
import type {
  CrudAction,
  GroupedResource,
  PermissionMap,
  ResourceItem,
} from "../../../domain/entities/permission";

const ACTIONS: CrudAction[] = ["create", "read", "update", "delete"];

export function useRolePermissionsMatrix(
  permMap: PermissionMap,
  setPermMap: React.Dispatch<React.SetStateAction<PermissionMap>>,
  resources: ResourceItem[],
  isView: boolean,
  t: (key: string, fallback?: string) => string,
) {
  const groupedResources = React.useMemo<GroupedResource[]>(() => {
    const groups: GroupedResource[] = [];
    const matchedKeys = new Set<string>();

    for (const group of PERMISSION_RESOURCE_GROUPS) {
      const groupItems: ResourceItem[] = [];
      for (const resKey of group.resources) {
        const found = resources.find((r) => r.resource === resKey);
        if (found) {
          groupItems.push(found);
          matchedKeys.add(resKey);
        }
      }
      if (groupItems.length > 0) {
        groups.push({
          groupKey: group.groupKey,
          label: t(group.labelKey, group.defaultLabel),
          items: groupItems,
        });
      }
    }

    const remainingItems = resources.filter(
      (r) => !matchedKeys.has(r.resource),
    );
    if (remainingItems.length > 0) {
      groups.push({
        groupKey: "other",
        label: t("v2.rbacRoles.groups.other", "Tài nguyên khác"),
        items: remainingItems,
      });
    }
    return groups;
  }, [resources, t]);

  const toggle = (resource: string, action: CrudAction) => {
    if (isView) return;
    setPermMap((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource]?.[action],
      },
    }));
  };

  const toggleRow = (resource: string, value: boolean) => {
    if (isView) return;
    setPermMap((prev) => ({
      ...prev,
      [resource]: { create: value, read: value, update: value, delete: value },
    }));
  };

  const toggleColumn = (action: CrudAction, value: boolean) => {
    if (isView) return;
    setPermMap((prev) => {
      const next = { ...prev };
      for (const r of resources) {
        next[r.resource] = { ...next[r.resource], [action]: value };
      }
      return next;
    });
  };

  const toggleAll = (value: boolean) => {
    if (isView) return;
    setPermMap(() => {
      const next: PermissionMap = {};
      for (const r of resources) {
        next[r.resource] = {
          create: value,
          read: value,
          update: value,
          delete: value,
        };
      }
      return next;
    });
  };

  const toggleGroup = (items: ResourceItem[], value: boolean) => {
    if (isView) return;
    setPermMap((prev) => {
      const next = { ...prev };
      for (const item of items) {
        next[item.resource] = {
          create: value,
          read: value,
          update: value,
          delete: value,
        };
      }
      return next;
    });
  };

  const isRowFull = (resource: string) =>
    ACTIONS.every((a) => Boolean(permMap[resource]?.[a]));

  const isColumnFull = (action: CrudAction) =>
    resources.length > 0 &&
    resources.every((r) => Boolean(permMap[r.resource]?.[action]));

  const isGroupFull = (items: ResourceItem[]) =>
    items.length > 0 && items.every((i) => isRowFull(i.resource));

  const isAllFull = () =>
    resources.length > 0 && resources.every((r) => isRowFull(r.resource));

  const isAnyChecked = () =>
    resources.some((r) =>
      ACTIONS.some((a) => Boolean(permMap[r.resource]?.[a])),
    );

  const totalGrantedPermissions = React.useMemo(() => {
    let count = 0;
    for (const res of Object.values(permMap)) {
      if (res?.create) count++;
      if (res?.read) count++;
      if (res?.update) count++;
      if (res?.delete) count++;
    }
    return count;
  }, [permMap]);

  return {
    groupedResources,
    toggle,
    toggleRow,
    toggleColumn,
    toggleAll,
    toggleGroup,
    isRowFull,
    isColumnFull,
    isGroupFull,
    isAllFull,
    isAnyChecked,
    totalGrantedPermissions,
  };
}
