import type { DrawerAuditItem } from "@/v2/shared/components/molecules/v2-drawer-history-tab";
import type {
  PermissionMap,
  ResourceItem,
} from "../domain/entities/permission";
import type { Role } from "../domain/entities/role";

export function buildInitialPermissionMap(
  resources: ResourceItem[],
  permissions: { resource: string; action: string }[] = [],
): PermissionMap {
  const map: PermissionMap = {};
  for (const r of resources) {
    map[r.resource] = {
      create: false,
      read: false,
      update: false,
      delete: false,
    };
  }

  for (const p of permissions) {
    if (p.action === "*") {
      if (p.resource === "*") {
        for (const r of resources) {
          map[r.resource] = {
            create: true,
            read: true,
            update: true,
            delete: true,
          };
        }
      } else if (map[p.resource]) {
        map[p.resource] = {
          create: true,
          read: true,
          update: true,
          delete: true,
        };
      }
    } else if (map[p.resource] && p.action in map[p.resource]) {
      map[p.resource][p.action as keyof (typeof map)[string]] = true;
    }
  }
  return map;
}

export function serializePermissionsMap(
  permMap: PermissionMap,
): { resource: string; action: string }[] {
  const list: { resource: string; action: string }[] = [];
  for (const [res, actions] of Object.entries(permMap)) {
    for (const [act, granted] of Object.entries(actions)) {
      if (granted) list.push({ resource: res, action: act });
    }
  }
  return list;
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
