import { describe, expect, it, vi } from "vitest";
import type { UserRecord } from "../domain/user";
import { buildUserRowActions } from "./userRowActions";

const t = (_key: string, fallback?: string) => fallback ?? _key;
const row = (over: Partial<UserRecord> = {}) =>
  ({ id: "u1", email: "a@b.vn", status: "ACTIVE", ...over }) as UserRecord;
const ctx = (over = {}) => ({
  t,
  canManage: true,
  canImpersonate: true,
  onOpen: vi.fn(),
  onToggleStatus: vi.fn(),
  onResetPassword: vi.fn(),
  onImpersonate: vi.fn(),
  ...over,
});
const labels = (r: UserRecord, c = ctx()) =>
  buildUserRowActions(r, c)[0].items.map((i) => i.label);

describe("buildUserRowActions", () => {
  it("không có quyền manage chỉ còn Xem chi tiết", () => {
    expect(labels(row(), ctx({ canManage: false }))).toEqual(["Xem chi tiết"]);
  });

  it("admin thấy Đăng nhập dưới quyền với user ACTIVE khác admin", () => {
    expect(labels(row())).toContain("Đăng nhập dưới quyền");
  });

  it("ẩn impersonate khi không được phép, user INACTIVE hoặc là admin gốc", () => {
    expect(labels(row(), ctx({ canImpersonate: false }))).not.toContain(
      "Đăng nhập dưới quyền",
    );
    expect(labels(row({ status: "INACTIVE" }))).not.toContain(
      "Đăng nhập dưới quyền",
    );
    expect(labels(row({ email: "admin@liouni.com" }))).not.toContain(
      "Đăng nhập dưới quyền",
    );
  });

  it("bấm impersonate gọi đúng handler với dòng đó", () => {
    const c = ctx();
    const r = row();
    const item = buildUserRowActions(r, c)[0].items.find(
      (i) => i.label === "Đăng nhập dưới quyền",
    );
    item?.onClick?.();
    expect(c.onImpersonate).toHaveBeenCalledWith(r);
  });
});
