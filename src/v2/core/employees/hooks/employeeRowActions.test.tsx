import { describe, expect, it, vi } from "vitest";
import type { EmployeeRecord } from "../domain/employee";
import { buildEmployeeRowActions } from "./employeeRowActions";

const row = (extra: Partial<EmployeeRecord> = {}) =>
  ({
    id: "e1",
    employeeCode: "NV-001",
    fullName: "An",
    status: "ACTIVE",
    ...extra,
  }) as EmployeeRecord;

const labels = (
  record: EmployeeRecord,
  perms: { canUpdate: boolean; canDelete: boolean },
) =>
  buildEmployeeRowActions(record, {
    t: (_key, fallback) => fallback ?? "",
    ...perms,
    onOpen: vi.fn(),
    onToggleStatus: vi.fn(),
    onDelete: vi.fn(),
  })[0].items.map((item) => item.label);

describe("buildEmployeeRowActions", () => {
  it("chỉ có quyền đọc thì chỉ được xem chi tiết", () => {
    expect(labels(row(), { canUpdate: false, canDelete: false })).toEqual([
      "Xem chi tiết",
    ]);
  });

  it("có quyền sửa thì thêm Chỉnh sửa và đổi trạng thái theo trạng thái hiện tại", () => {
    expect(labels(row(), { canUpdate: true, canDelete: false })).toEqual([
      "Xem chi tiết",
      "Chỉnh sửa",
      "Chuyển sang nghỉ việc",
    ]);
    expect(
      labels(row({ status: "INACTIVE" }), {
        canUpdate: true,
        canDelete: false,
      }),
    ).toContain("Chuyển sang đang làm");
  });

  it("có quyền xóa thì hiện Xóa, nhưng ẩn khi còn tài khoản liên kết", () => {
    expect(labels(row(), { canUpdate: false, canDelete: true })).toContain(
      "Xóa",
    );
    expect(
      labels(row({ linkedUser: { id: "u1", email: "a@b.c" } }), {
        canUpdate: true,
        canDelete: true,
      }),
    ).not.toContain("Xóa");
  });
});
