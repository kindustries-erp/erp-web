import type { EmployeeFormValue } from "../../../domain/employee";
import type { EmployeeFormError } from "../../../domain/rules/employeeRules";

export interface EmployeeChoice {
  value: string;
  label: string;
}

export interface EmployeeFormProps {
  form: EmployeeFormValue;
  viewing: boolean;
  creating: boolean;
  error: EmployeeFormError | null;
  branchOptions: EmployeeChoice[];
  branchLoading: boolean;
  /** Nhãn chi nhánh hiện tại, dùng khi chưa có trong danh sách chọn */
  branchFallbackLabel?: string;
  /** CCCD đầy đủ chỉ nạp được khi có quyền sửa; ngược lại hiển thị bản che */
  nationalIdMasked?: string | null;
  linkedUserEmail?: string;
  t: (key: string, fallback?: string) => string;
  setField: <K extends keyof EmployeeFormValue>(
    key: K,
    value: EmployeeFormValue[K],
  ) => void;
}
