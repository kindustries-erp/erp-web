import {
  DrawerField,
  DrawerSection,
  V2ReadValue as ReadValue,
} from "@/v2/shared/components";
import type { EmployeeFormProps } from "./EmployeeForm.type";

/** Tài khoản đăng nhập đang liên kết: chỉ đọc, liên kết quản lý ở màn tài khoản */
export function EmployeeAccountSection({
  linkedUserEmail,
  t,
}: Pick<EmployeeFormProps, "linkedUserEmail" | "t">) {
  return (
    <DrawerSection title={t("v2.employees.form.account", "Tài khoản liên kết")}>
      <DrawerField label={t("v2.employees.columns.account", "Tài khoản")}>
        <ReadValue
          value={
            linkedUserEmail ||
            t("v2.employees.form.noAccount", "Chưa liên kết tài khoản")
          }
        />
      </DrawerField>
    </DrawerSection>
  );
}
