import { describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { emptyUserForm } from "../domain/user";
import {
  toCreateUserPayload,
  toUpdateUserPayload,
  toUserListParams,
  usersV2Api,
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

describe("usersV2Api.listEmployees", () => {
  it("lấy nhân viên đang làm từ API v2, không dùng endpoint v1", async () => {
    const get = vi
      .spyOn(v2HttpClient, "get")
      .mockResolvedValue({ data: { items: [{ id: "e1" }] } });
    const result = await usersV2Api.listEmployees();
    expect(get).toHaveBeenCalledWith(
      "/api/v2/employees",
      expect.objectContaining({
        params: expect.objectContaining({ status: "ACTIVE" }),
      }),
    );
    expect(result).toEqual([{ id: "e1" }]);
    get.mockRestore();
  });
});
