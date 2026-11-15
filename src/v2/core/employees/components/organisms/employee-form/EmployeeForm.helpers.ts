import { formatVnDate, vnDateToIso } from "../../../domain/rules/employeeDates";
import type { EmployeeFormError } from "../../../domain/rules/employeeRules";

type Translate = (key: string, fallback?: string) => string;

const errorKeys: Record<string, [string, string]> = {
  requiredFullName: [
    "v2.employees.form.requiredFullName",
    "Họ tên là bắt buộc",
  ],
  invalidEmail: ["v2.employees.form.invalidEmail", "Email không hợp lệ"],
  invalidNationalId: [
    "v2.employees.form.invalidNationalId",
    "CCCD gồm 12 số (hoặc CMND 9 số)",
  ],
  futureBirthDate: [
    "v2.employees.form.futureBirthDate",
    "Ngày sinh không được ở tương lai",
  ],
  leaveBeforeStart: [
    "v2.employees.form.leaveBeforeStart",
    "Ngày nghỉ việc phải sau ngày vào làm",
  ],
};

/** Hiển thị `yyyy-MM-dd` ở chế độ xem, theo định dạng dd/MM/yyyy */
export const viewDate = (value: string) =>
  value ? formatVnDate(vnDateToIso(value)) : "";

/** Thông báo lỗi của đúng trường (rỗng nếu lỗi hiện tại thuộc trường khác) */
export const fieldError = (
  t: Translate,
  error: EmployeeFormError | null,
  key: EmployeeFormError,
): string => (error === key ? t(...errorKeys[key]) : "");
