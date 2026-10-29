import type * as React from "react";

export type V2FormMode = "view" | "edit" | "create";

export interface UseV2FormOptions<T extends Record<string, any>> {
  /** Giá trị ban đầu của form (hoặc hàm khởi tạo) */
  initialValues: T | (() => T);
  /** Hàm validate toàn cục nhận values và trả về map các lỗi { [field]: errorMessage } */
  validate?: (values: T) => Partial<Record<keyof T, string>> | undefined | null;
  /** Callback được gọi khi submit thành công (sau khi đã pass validation) */
  onSubmit?: (values: T) => void | Promise<void>;
  /** Chế độ hiển thị: view, edit hoặc create (mặc định: edit) */
  mode?: V2FormMode;
  /** Tự động hiện toast báo lỗi trường đầu tiên khi submit không hợp lệ (mặc định: true) */
  showErrorToast?: boolean;
  /** Tiêu đề toast khi thiếu thông tin (mặc định lấy theo i18n v2.form.missingInfo) */
  errorToastTitle?: string;
}

export interface V2FieldBindingProps<V = any> {
  name: string;
  value: V;
  onChange: (value: V) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  viewing?: boolean;
  disabled?: boolean;
}

export interface UseV2FormReturn<T extends Record<string, any>> {
  /** Giá trị hiện tại của form */
  values: T;
  /** Map lỗi của các trường */
  errors: Partial<Record<keyof T, string>>;
  /** Map trạng thái đã blur qua trường */
  touched: Partial<Record<keyof T, boolean>>;
  /** True nếu form đã bị thay đổi so với initialValues */
  isDirty: boolean;
  /** True nếu form không có lỗi validation nào */
  isValid: boolean;
  /** True khi onSubmit async đang chạy */
  isSubmitting: boolean;
  /** Chế độ form hiện tại */
  mode: V2FormMode;
  /** Cập nhật chế độ form */
  setMode: (mode: V2FormMode) => void;
  /** Gán giá trị cho 1 trường */
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Gán hoặc xóa lỗi cho 1 trường */
  setFieldError: (field: keyof T, error?: string | null) => void;
  /** Đánh dấu trường đã touched */
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void;
  /** Cập nhật toàn bộ hoặc một phần values */
  setValues: (updater: Partial<T> | ((prev: T) => T)) => void;
  /** Handler khi blur khỏi trường */
  handleBlur: (field: keyof T) => void;
  /** Reset form về giá trị ban đầu hoặc giá trị mới */
  reset: (newInitialValues?: T) => void;
  /** Chạy validation thủ công, trả về true nếu hợp lệ */
  validateForm: () => boolean;
  /** Xử lý submit: chặn default, validate, toast lỗi nếu có, gọi onSubmit */
  handleSubmit: (e?: React.FormEvent) => Promise<boolean>;
  /** Helper liên kết field vào V2FormField siêu nhanh */
  register: <K extends keyof T>(
    field: K,
    config?: Partial<V2FieldBindingProps<T[K]>>,
  ) => V2FieldBindingProps<T[K]>;
}
