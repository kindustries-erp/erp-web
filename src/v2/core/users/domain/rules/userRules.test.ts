import { describe, expect, it } from "vitest";
import { emptyUserForm } from "../user";
import {
  canEditUserEmail,
  isUserFormDirty,
  isUserInactive,
  validateUserForm,
} from "./userRules";

describe("userRules", () => {
  it("báo thiếu email và email sai định dạng", () => {
    expect(validateUserForm(emptyUserForm(), false)).toBe("requiredEmail");
    expect(validateUserForm({ ...emptyUserForm(), email: "abc" }, false)).toBe(
      "invalidEmail",
    );
  });

  it("chỉ kiểm độ dài mật khẩu khi tạo mới", () => {
    const form = { ...emptyUserForm(), email: "a@b.vn", password: "ngan" };
    expect(validateUserForm(form, true)).toBe("passwordLength");
    expect(validateUserForm(form, false)).toBeNull();
    expect(
      validateUserForm({ ...form, password: "12345678" }, true),
    ).toBeNull();
  });

  it("phát hiện form đã sửa và khóa email khi sửa", () => {
    const a = emptyUserForm();
    expect(isUserFormDirty(a, { ...a })).toBe(false);
    expect(isUserFormDirty({ ...a, email: "x" }, a)).toBe(true);
    expect(canEditUserEmail(true)).toBe(true);
    expect(canEditUserEmail(false)).toBe(false);
    expect(isUserInactive("INACTIVE")).toBe(true);
  });
});
