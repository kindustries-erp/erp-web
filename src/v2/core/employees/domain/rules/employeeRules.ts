import type { EmployeeFormValue, EmployeeRecord } from "../employee";
import { isoToVnDate, todayVnDate } from "./employeeDates";

export type EmployeeFormError =
  | "requiredFullName"
  | "invalidEmail"
  | "invalidNationalId"
  | "futureBirthDate"
  | "leaveBeforeStart";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** CCCD 12 số hoặc CMND 9 số, khớp backend */
const NATIONAL_ID_PATTERN = /^(\d{9}|\d{12})$/;

export const isEmployeeInactive = (status: string): boolean =>
  status === "INACTIVE";

/** Trả về lỗi đầu tiên của form, hoặc null nếu hợp lệ. `today` dạng `yyyy-MM-dd` (giờ VN). */
export const validateEmployeeForm = (
  form: EmployeeFormValue,
  today: string = todayVnDate(),
): EmployeeFormError | null => {
  if (!form.fullName.trim()) return "requiredFullName";
  const email = form.email.trim();
  if (email && !EMAIL_PATTERN.test(email)) return "invalidEmail";
  const nationalId = form.nationalId.trim();
  if (nationalId && !NATIONAL_ID_PATTERN.test(nationalId)) {
    return "invalidNationalId";
  }
  if (form.birthDate && form.birthDate > today) return "futureBirthDate";
  if (form.startDate && form.leaveDate && form.leaveDate < form.startDate) {
    return "leaveBeforeStart";
  }
  return null;
};

export const isEmployeeFormDirty = (
  form: EmployeeFormValue,
  initial: EmployeeFormValue,
): boolean => JSON.stringify(form) !== JSON.stringify(initial);

/** Nhân viên còn liên kết tài khoản thì không xóa được (backend cũng chặn) */
export const canDeleteEmployee = (row: EmployeeRecord): boolean =>
  !row.linkedUser;

/** Chuyển bản ghi API sang giá trị form; CCCD đầy đủ truyền riêng vì bản ghi chỉ có bản che */
export const toEmployeeForm = (
  data: EmployeeRecord,
  nationalId = "",
): EmployeeFormValue => ({
  employeeCode: data.employeeCode ?? "",
  fullName: data.fullName ?? "",
  email: data.email ?? "",
  phone: data.phone ?? "",
  status: data.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  address: data.address ?? "",
  notes: data.notes ?? "",
  birthDate: isoToVnDate(data.birthDate),
  startDate: isoToVnDate(data.startDate),
  leaveDate: isoToVnDate(data.leaveDate),
  jobTitle: data.jobTitle ?? "",
  department: data.department ?? "",
  branchId: data.branchId ?? "",
  nationalId,
});
