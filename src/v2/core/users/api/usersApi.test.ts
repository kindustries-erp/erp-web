import { describe, expect, it } from "vitest";
import { emptyUserForm } from "../domain/user";
import {
  toCreateUserPayload,
  toUpdateUserPayload,
  toUserListParams,
} from "./usersApi";

describe("usersApi mappers", () => {
  it("payload tạo: cắt email, bỏ employeeId rỗng", () => {
    const form = {
      ...emptyUserForm(),
      email: "  a@b.vn ",
      password: "12345678",
    };
    expect(toCreateUserPayload(form)).toEqual({
      email: "a@b.vn",
      password: "12345678",
      employeeId: undefined,
    });
  });

  it("payload sửa: không gửi email/mật khẩu, employeeId rỗng thành null", () => {
    const payload = toUpdateUserPayload({
      ...emptyUserForm(),
      email: "a@b.vn",
      password: "x",
      status: "INACTIVE",
    });
    expect(payload).toEqual({ status: "INACTIVE", employeeId: null });
  });

  it("tham số danh sách: sort kiểu -col, JSON cho filter", () => {
    const params = toUserListParams({
      page: 2,
      pageSize: 20,
      search: " x ",
      sorts: [{ columnKey: "createdAt", direction: "desc" }],
      columnFilters: { status: ["ACTIVE"] },
      columnSearch: {},
      columnOperators: {},
      dateRanges: {},
    } as never);
    expect(params.sort).toBe("-createdAt");
    expect(params.search).toBe("x");
    expect(params.column_filters).toBe('{"status":["ACTIVE"]}');
    expect(params.column_search).toBeUndefined();
  });
});
