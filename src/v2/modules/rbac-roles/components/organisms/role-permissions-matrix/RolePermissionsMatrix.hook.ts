import * as React from "react";
import { PERMISSION_RESOURCE_GROUPS } from "@/modules/system/types/rbac";
import {
  supportedActionsOf,
  type GroupedResource,
  type PermissionAction,
  type PermissionMap,
  type ResourceItem,
} from "../../../domain/entities/permission";

/** Gán `value` cho các action của một resource (bỏ qua action không hỗ trợ). */
function withActions(
  prev: PermissionMap,
  resource: string,
  actions: PermissionAction[],
  value: boolean,
): PermissionMap {
  const next = { ...prev };
  next[resource] = { ...next[resource] };
  for (const a of actions) next[resource][a] = value;
  return next;
}

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

  const actionsOf = (resource: string): PermissionAction[] => {
    const item = resources.find((r) => r.resource === resource);
    return item ? supportedActionsOf(item) : [];
  };

  const toggle = (resource: string, action: PermissionAction) => {
    if (isView || !actionsOf(resource).includes(action)) return;
    setPermMap((prev) =>
      withActions(prev, resource, [action], !prev[resource]?.[action]),
    );
  };

  const toggleRow = (resource: string, value: boolean) => {
    if (isView) return;
    setPermMap((prev) =>
      withActions(prev, resource, actionsOf(resource), value),
    );
  };

  const toggleColumn = (action: PermissionAction, value: boolean) => {
    if (isView) return;
    setPermMap((prev) => {
      let next = prev;
      for (const r of resources) {
        if (supportedActionsOf(r).includes(action)) {
          next = withActions(next, r.resource, [action], value);
        }
      }
      return next;
    });
  };

  const toggleItems = (items: ResourceItem[], value: boolean) => {
    setPermMap((prev) => {
      let next = prev;
      for (const item of items) {
        next = withActions(
          next,
          item.resource,
          supportedActionsOf(item),
          value,
        );
      }
      return next;
    });
  };

  const toggleAll = (value: boolean) => {
    if (isView) return;
    toggleItems(resources, value);
  };

  const toggleGroup = (items: ResourceItem[], value: boolean) => {
    if (isView) return;
    toggleItems(items, value);
  };

  const isRowFull = (resource: string) => {
    const acts = actionsOf(resource);
    return (
      acts.length > 0 && acts.every((a) => Boolean(permMap[resource]?.[a]))
    );
  };

  const isColumnFull = (action: PermissionAction) => {
    const supporting = resources.filter((r) =>
      supportedActionsOf(r).includes(action),
    );
    return (
      supporting.length > 0 &&
      supporting.every((r) => Boolean(permMap[r.resource]?.[action]))
    );
  };

  const isGroupFull = (items: ResourceItem[]) =>
    items.length > 0 && items.every((i) => isRowFull(i.resource));

  const isAllFull = () =>
    resources.length > 0 && resources.every((r) => isRowFull(r.resource));

  const isAnyChecked = () =>
    resources.some((r) =>
      actionsOf(r.resource).some((a) => Boolean(permMap[r.resource]?.[a])),
    );

  const totalGrantedPermissions = React.useMemo(() => {
    let count = 0;
    for (const res of Object.values(permMap)) {
      count += Object.values(res ?? {}).filter(Boolean).length;
    }
    return count;
  }, [permMap]);

  return {
    groupedResources,
    actionsOf,
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
