import { describe, expect, it } from "vitest";
import { emptyEmployeeForm } from "../domain/employee";
import { toEmployeePayload } from "./employeesApi";

const form = {
  ...emptyEmployeeForm(),
  fullName: "  An  ",
  birthDate: "1990-05-01",
};

describe("toEmployeePayload", () => {
  it("tạo: cắt khoảng trắng, bỏ trường rỗng, ngày thành ISO 00:00 giờ VN", () => {
    const payload = toEmployeePayload(form, true);
    expect(payload.fullName).toBe("An");
    expect(payload.birthDate).toBe("1990-04-30T17:00:00.000Z");
    expect(payload.email).toBeUndefined();
    expect(payload.branchId).toBeUndefined();
    expect(payload.startDate).toBeUndefined();
  });
  it("sửa: trường nullable bị xóa gửi null để backend xóa giá trị", () => {
    const payload = toEmployeePayload(form, false);
    expect(payload.email).toBeNull();
    expect(payload.branchId).toBeNull();
    expect(payload.nationalId).toBeNull();
    expect(payload.leaveDate).toBeNull();
  });
});
