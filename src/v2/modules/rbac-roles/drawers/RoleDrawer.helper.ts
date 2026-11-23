import type { DrawerAuditItem } from "@/v2/shared/components/molecules/v2-drawer-history-tab";
import {
  supportedActionsOf,
  type PermissionAction,
  type PermissionMap,
  type ResourceItem,
} from "../domain/entities/permission";
import type { Role } from "../domain/entities/role";

type RawPermission = { resource: string; action: string; conditions?: unknown };

/**
 * Phần quyền không hiển thị được trên ma trận: giữ nguyên khi lưu để không mất.
 * - isWildcard: role có `*:*` (Super Admin). Ma trận chỉ xem, lưu chỉ gửi lại `*:*`.
 * - preserved: dòng có action/resource UI không điều khiển được.
 * - conditions: điều kiện gốc của dòng CRUD/approval UI đang quản lý (key `resource|action`).
 */
export interface RolePermissionMeta {
  isWildcard: boolean;
  preserved: RawPermission[];
  conditions: Record<string, unknown>;
}

export const EMPTY_ROLE_PERMISSION_META: RolePermissionMeta = {
  isWildcard: false,
  preserved: [],
  conditions: {},
};

export function extractRolePermissionMeta(
  resources: ResourceItem[],
  permissions: RawPermission[] = [],
): RolePermissionMeta {
  const isWildcard = permissions.some(
    (p) => p.resource === "*" && p.action === "*",
  );
  if (isWildcard) return { ...EMPTY_ROLE_PERMISSION_META, isWildcard: true };

  const byKey = new Map(resources.map((r) => [r.resource, r]));
  const preserved: RawPermission[] = [];
  const conditions: Record<string, unknown> = {};
  for (const p of permissions) {
    const item = byKey.get(p.resource);
    const representable =
      item !== undefined &&
      (p.action === "*" ||
        supportedActionsOf(item).includes(p.action as PermissionAction));
    if (!representable) {
      preserved.push({
        resource: p.resource,
        action: p.action,
        ...(p.conditions !== undefined && p.conditions !== null
          ? { conditions: p.conditions }
          : {}),
      });
    } else if (p.conditions !== undefined && p.conditions !== null) {
      conditions[`${p.resource}|${p.action}`] = p.conditions;
    }
  }
  return { isWildcard: false, preserved, conditions };
}

export function buildInitialPermissionMap(
  resources: ResourceItem[],
  permissions: RawPermission[] = [],
): PermissionMap {
  const map: PermissionMap = {};
  for (const r of resources) {
    map[r.resource] = {};
    for (const a of supportedActionsOf(r)) map[r.resource][a] = false;
  }

  const grantAll = (resource: string) => {
    const item = resources.find((r) => r.resource === resource);
    if (!item) return;
    for (const a of supportedActionsOf(item)) map[resource][a] = true;
  };

  for (const p of permissions) {
    if (p.resource === "*" && p.action === "*") {
      for (const r of resources) grantAll(r.resource);
    } else if (p.action === "*") {
      grantAll(p.resource);
    } else if (map[p.resource] && p.action in map[p.resource]) {
      map[p.resource][p.action as PermissionAction] = true;
    }
  }
  return map;
}

/** Ghi lại danh sách quyền: phần UI + phần giữ nguyên. Role `*:*` chỉ gửi lại `*:*`. */
export function serializePermissionsMap(
  permMap: PermissionMap,
  meta: RolePermissionMeta = EMPTY_ROLE_PERMISSION_META,
): RawPermission[] {
  if (meta.isWildcard) return [{ resource: "*", action: "*" }];

  const list: RawPermission[] = [];
  for (const [res, actions] of Object.entries(permMap)) {
    for (const [act, granted] of Object.entries(actions)) {
      if (!granted) continue;
      const cond = meta.conditions[`${res}|${act}`];
      list.push(
        cond !== undefined
          ? { resource: res, action: act, conditions: cond }
          : { resource: res, action: act },
      );
    }
  }
  const cleanPreserved: RawPermission[] = (meta.preserved || []).map((p) => ({
    resource: p.resource,
    action: p.action,
    ...(p.conditions !== undefined && p.conditions !== null
      ? { conditions: p.conditions }
      : {}),
  }));
  return [...list, ...cleanPreserved];
}

export function buildRoleHistoryItems(
  roleDetail: Role | null,
  fallbackName: string,
): DrawerAuditItem[] {
  if (!roleDetail) return [];
  const items: DrawerAuditItem[] = [];
  const fmt = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
  if (roleDetail.createdAt) {
    items.push({
      id: "created",
      action: "Khởi tạo vai trò",
      timestamp: fmt.format(new Date(roleDetail.createdAt)),
      details: `Vai trò "${fallbackName || roleDetail.name}" được tạo trên hệ thống`,
      variant: "success",
    });
  }
  if (roleDetail.updatedAt && roleDetail.updatedAt !== roleDetail.createdAt) {
    items.push({
      id: "updated",
      action: "Cập nhật gần nhất",
      timestamp: fmt.format(new Date(roleDetail.updatedAt)),
      details:
        "Thay đổi thông tin vai trò, ma trận quyền hoặc danh sách người dùng",
      variant: "default",
    });
  }
  return items;
}
