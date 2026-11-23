export type EmployeeStatus = "ACTIVE" | "INACTIVE";

/** Chi nhánh rút gọn kèm trong bản ghi nhân viên */
export interface EmployeeBranch {
  id: string;
  code: string;
  name: string;
}

/** Tài khoản đăng nhập đang liên kết với nhân viên (chỉ đọc, liên kết đi qua users-management) */
export interface EmployeeLinkedUser {
  id: string;
  email: string;
}

/**
 * Bản ghi nhân viên như `/api/v2/employees` trả về.
 * CCCD chỉ có bản che (`nationalIdMasked`); bản đầy đủ lấy qua endpoint riêng khi sửa.
 * Các ngày là ISO UTC; ngày thuần (sinh, vào làm, nghỉ việc) hiển thị theo giờ VN.
 */
export interface EmployeeRecord {
  id: string;
  extraData: Record<string, unknown>;
  employeeCode: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  status: EmployeeStatus | string;
  address?: string | null;
  notes?: string | null;
  birthDate?: string | null;
  startDate?: string | null;
  leaveDate?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  branchId?: string | null;
  branch?: EmployeeBranch | null;
  nationalIdMasked?: string | null;
  linkedUser?: EmployeeLinkedUser | null;
  createdAt: string;
  updatedAt: string;
}

/** Giá trị form: mọi trường là chuỗi, ngày dạng `yyyy-MM-dd` (giờ VN), rỗng nghĩa là chưa nhập */
export interface EmployeeFormValue {
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  address: string;
  notes: string;
  birthDate: string;
  startDate: string;
  leaveDate: string;
  jobTitle: string;
  department: string;
  branchId: string;
  nationalId: string;
}

export const emptyEmployeeForm = (): EmployeeFormValue => ({
  employeeCode: "",
  fullName: "",
  email: "",
  phone: "",
  status: "ACTIVE",
  address: "",
  notes: "",
  birthDate: "",
  startDate: "",
  leaveDate: "",
  jobTitle: "",
  department: "",
  branchId: "",
  nationalId: "",
});
