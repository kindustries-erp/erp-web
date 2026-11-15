import { describe, expect, it } from "vitest";
import { emptyEmployeeForm, type EmployeeRecord } from "../employee";
import {
  canDeleteEmployee,
  isEmployeeFormDirty,
  toEmployeeForm,
  validateEmployeeForm,
} from "./employeeRules";

const base = { ...emptyEmployeeForm(), fullName: "An" };
const TODAY = "2026-11-15";

describe("validateEmployeeForm", () => {
  it("hợp lệ khi chỉ có họ tên", () => {
    expect(validateEmployeeForm(base, TODAY)).toBeNull();
  });
  it("bắt buộc họ tên", () => {
    expect(validateEmployeeForm(emptyEmployeeForm(), TODAY)).toBe(
      "requiredFullName",
    );
  });
  it("email sai định dạng", () => {
    expect(validateEmployeeForm({ ...base, email: "abc" }, TODAY)).toBe(
      "invalidEmail",
    );
  });
  it("CCCD chỉ nhận 9 hoặc 12 chữ số", () => {
    expect(validateEmployeeForm({ ...base, nationalId: "123" }, TODAY)).toBe(
      "invalidNationalId",
    );
    expect(
      validateEmployeeForm({ ...base, nationalId: "012345678901" }, TODAY),
    ).toBeNull();
    expect(
      validateEmployeeForm({ ...base, nationalId: "123456789" }, TODAY),
    ).toBeNull();
  });
  it("ngày sinh không ở tương lai", () => {
    expect(
      validateEmployeeForm({ ...base, birthDate: "2026-11-16" }, TODAY),
    ).toBe("futureBirthDate");
  });
  it("ngày nghỉ không trước ngày vào làm", () => {
    expect(
      validateEmployeeForm(
        { ...base, startDate: "2026-02-01", leaveDate: "2026-01-01" },
        TODAY,
      ),
    ).toBe("leaveBeforeStart");
  });
});

describe("toEmployeeForm / dirty / delete", () => {
  const record = {
    id: "1",
    extraData: {},
    employeeCode: "NV-001",
    fullName: "An",
    status: "INACTIVE",
    birthDate: "1990-04-30T17:00:00.000Z",
    branchId: "b1",
    createdAt: "",
    updatedAt: "",
  } as EmployeeRecord;

  it("đổi bản ghi sang form theo giờ VN, trường thiếu thành chuỗi rỗng", () => {
    const form = toEmployeeForm(record, "012345678901");
    expect(form.birthDate).toBe("1990-05-01");
    expect(form.status).toBe("INACTIVE");
    expect(form.jobTitle).toBe("");
    expect(form.nationalId).toBe("012345678901");
  });
  it("dirty khi form khác ban đầu", () => {
    expect(isEmployeeFormDirty(base, base)).toBe(false);
    expect(isEmployeeFormDirty({ ...base, phone: "1" }, base)).toBe(true);
  });
  it("không xóa được nhân viên còn tài khoản liên kết", () => {
    expect(canDeleteEmployee(record)).toBe(true);
    expect(
      canDeleteEmployee({ ...record, linkedUser: { id: "u", email: "a@b.c" } }),
    ).toBe(false);
  });
});
