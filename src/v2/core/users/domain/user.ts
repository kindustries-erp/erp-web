export type UserStatus = "ACTIVE" | "INACTIVE";

/** Tóm tắt nhân viên liên kết với tài khoản (API trả kèm trong bản ghi user) */
export interface UserEmployeeSummary {
  id: string;
  fullName: string;
  employeeCode: string;
  email?: string | null;
  phone?: string | null;
  status: string;
}

/** Bản ghi tài khoản như `/api/v2/users-management` trả về (không bao giờ có mật khẩu) */
export interface UserRecord {
  id: string;
  email: string;
  status: UserStatus | string;
  employeeId: string | null;
  employee: UserEmployeeSummary | null;
  /** ISO UTC; hiển thị theo múi giờ trình duyệt */
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
  extraData: Record<string, unknown>;
}

/** Giá trị form tạo/sửa tài khoản. `password` chỉ dùng khi tạo mới. */
export interface UserFormValue {
  email: string;
  password: string;
  status: UserStatus;
  employeeId: string;
}

export const emptyUserForm = (): UserFormValue => ({
  email: "",
  password: "",
  status: "ACTIVE",
  employeeId: "",
});
