import {
  DrawerSection,
  V2DrawerRowList,
  type DrawerRowConfig,
} from "@/v2/shared/components";
import type { EmployeeFormProps } from "./EmployeeForm.type";

/** Tài khoản đăng nhập đang liên kết: chỉ đọc ở mọi mode, liên kết quản lý ở màn tài khoản */
export function EmployeeAccountSection({
  linkedUserEmail,
  t,
}: Pick<EmployeeFormProps, "linkedUserEmail" | "t">) {
  const rows: DrawerRowConfig[] = [
    {
      key: "account",
      label: t("v2.employees.columns.account", "Tài khoản"),
      value:
        linkedUserEmail ||
        t("v2.employees.form.noAccount", "Chưa liên kết tài khoản"),
      copyable: Boolean(linkedUserEmail),
    },
  ];
  return (
    <DrawerSection title={t("v2.employees.form.account", "Tài khoản liên kết")}>
      <V2DrawerRowList rows={rows} />
    </DrawerSection>
  );
}
