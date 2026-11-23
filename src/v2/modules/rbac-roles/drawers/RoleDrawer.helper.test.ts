import { describe, expect, it } from "vitest";
import type { ResourceItem } from "../domain/entities/permission";
import {
  buildInitialPermissionMap,
  extractRolePermissionMeta,
  serializePermissionsMap,
} from "./RoleDrawer.helper";

const RESOURCES: ResourceItem[] = [
  { resource: "garage", label: "Garage" },
  {
    resource: "garage_procurement_orders",
    label: "Đơn mua hàng Garage",
    actions: ["approve", "reject"],
  },
];

describe("RoleDrawer.helper — quyền approve/reject", () => {
  it("(a) role có approve hiển thị tick và ghi lại đúng dòng approve", () => {
    const perms = [
      { resource: "garage_procurement_orders", action: "read" },
      { resource: "garage_procurement_orders", action: "approve" },
    ];
    const map = buildInitialPermissionMap(RESOURCES, perms);
    expect(map.garage_procurement_orders.approve).toBe(true);
    expect(map.garage_procurement_orders.reject).toBe(false);

    const meta = extractRolePermissionMeta(RESOURCES, perms);
    const saved = serializePermissionsMap(map, meta);
    expect(saved).toContainEqual({
      resource: "garage_procurement_orders",
      action: "approve",
    });
    expect(saved).toContainEqual({
      resource: "garage_procurement_orders",
      action: "read",
    });
  });

  it("(b) dòng purge và conditions không thuộc ma trận vẫn còn sau khi lưu", () => {
    const perms = [
      { resource: "garage_procurement_orders", action: "purge" },
      {
        resource: "garage_procurement_orders",
        action: "update",
        conditions: { branch: "P1" },
      },
    ];
    const map = buildInitialPermissionMap(RESOURCES, perms);
    const meta = extractRolePermissionMeta(RESOURCES, perms);
    const saved = serializePermissionsMap(map, meta);

    expect(saved).toContainEqual({
      resource: "garage_procurement_orders",
      action: "purge",
    });
    expect(saved).toContainEqual({
      resource: "garage_procurement_orders",
      action: "update",
      conditions: { branch: "P1" },
    });
  });

  it("(c) role *:* chỉ gửi lại *:* và ma trận ở trạng thái toàn quyền", () => {
    const perms = [{ resource: "*", action: "*" }];
    const meta = extractRolePermissionMeta(RESOURCES, perms);
    expect(meta.isWildcard).toBe(true);
    const map = buildInitialPermissionMap(RESOURCES, perms);
    expect(map.garage_procurement_orders.approve).toBe(true);
    expect(serializePermissionsMap(map, meta)).toEqual([
      { resource: "*", action: "*" },
    ]);
  });

  it("(d) resource không khai báo actions không sinh approve/reject trên ma trận", () => {
    const perms = [{ resource: "garage", action: "approve" }];
    const map = buildInitialPermissionMap(RESOURCES, perms);
    expect(map.garage.approve).toBeUndefined();

    const meta = extractRolePermissionMeta(RESOURCES, perms);
    expect(meta.preserved).toEqual([{ resource: "garage", action: "approve" }]);
    expect(serializePermissionsMap(map, meta)).toContainEqual({
      resource: "garage",
      action: "approve",
    });
  });

  it("không có meta thì serialize chỉ trả các ô đang tick", () => {
    const map = buildInitialPermissionMap(RESOURCES, [
      { resource: "garage", action: "read" },
    ]);
    expect(serializePermissionsMap(map)).toEqual([
      { resource: "garage", action: "read" },
    ]);
  });

  it("(e) loại bỏ hoàn toàn các trường DB entity (id, roleId, createdAt, updatedAt) khỏi payload serialize", () => {
    const rawPermsWithDbMetadata = [
      {
        id: "perm-uuid-1",
        roleId: "role-uuid-1",
        resource: "special_custom_resource",
        action: "custom_action",
        conditions: null,
        createdAt: "2026-11-14T00:00:00Z",
        updatedAt: "2026-11-14T00:00:00Z",
      },
    ] as any;

    const map = buildInitialPermissionMap(RESOURCES, rawPermsWithDbMetadata);
    const meta = extractRolePermissionMeta(RESOURCES, rawPermsWithDbMetadata);
    const serialized = serializePermissionsMap(map, meta);

    expect(serialized).toEqual([
      {
        resource: "special_custom_resource",
        action: "custom_action",
      },
    ]);
    expect((serialized[0] as any).id).toBeUndefined();
    expect((serialized[0] as any).roleId).toBeUndefined();
    expect((serialized[0] as any).createdAt).toBeUndefined();
    expect((serialized[0] as any).updatedAt).toBeUndefined();
  });
});
