import type { UserFormValue } from "../user";

export const USER_PASSWORD_MIN = 8;
export const USER_PASSWORD_MAX = 72;

export type UserFormError = "requiredEmail" | "invalidEmail" | "passwordLength";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidUserPassword = (password: string): boolean =>
  password.length >= USER_PASSWORD_MIN && password.length <= USER_PASSWORD_MAX;

/** Trả về lỗi đầu tiên của form, hoặc null nếu hợp lệ. Mật khẩu chỉ kiểm khi tạo mới. */
export const validateUserForm = (
  form: UserFormValue,
  creating: boolean,
): UserFormError | null => {
  const email = form.email.trim();
  if (!email) return "requiredEmail";
  if (!EMAIL_PATTERN.test(email)) return "invalidEmail";
  if (creating && !isValidUserPassword(form.password)) return "passwordLength";
  return null;
};

export const isUserFormDirty = (
  form: UserFormValue,
  initial: UserFormValue,
): boolean => JSON.stringify(form) !== JSON.stringify(initial);

/** Email là định danh đăng nhập, chỉ nhập khi tạo mới */
export const canEditUserEmail = (isCreating: boolean): boolean => isCreating;

export const isUserInactive = (status: string): boolean =>
  status === "INACTIVE";
