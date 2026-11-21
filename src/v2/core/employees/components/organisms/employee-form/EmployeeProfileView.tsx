import {
  DrawerSection,
  V2DrawerRowList,
  type DrawerRowConfig,
} from "@/v2/shared/components";
import type { EmployeeFormProps } from "./EmployeeForm.type";
import { viewDate } from "./EmployeeForm.helpers";

/** Chế độ xem thông tin chung: hiển thị nhãn - giá trị, không render ô nhập. */
export function EmployeeProfileView({
  form,
  nationalIdMasked,
  t,
}: Pick<EmployeeFormProps, "form" | "nationalIdMasked" | "t">) {
  const rows: DrawerRowConfig[] = [
    {
      key: "employeeCode",
      label: t("v2.employees.columns.employeeCode", "Mã"),
      value: form.employeeCode || "—",
      copyable: Boolean(form.employeeCode),
    },
    {
      key: "fullName",
      label: t("v2.employees.columns.fullName", "Họ tên"),
      value: form.fullName || "—",
    },
    {
      key: "phone",
      label: t("v2.employees.columns.phone", "Điện thoại"),
      value: form.phone || "—",
      copyable: Boolean(form.phone),
    },
    {
      key: "email",
      label: t("v2.employees.columns.email", "Email"),
      value: form.email || "—",
      copyable: Boolean(form.email),
    },
    {
      key: "birthDate",
      label: t("v2.employees.columns.birthDate", "Ngày sinh"),
      value: viewDate(form.birthDate) || "—",
    },
    {
      key: "nationalId",
      label: t("v2.employees.columns.nationalId", "CCCD"),
      value: nationalIdMasked || "—",
    },
    {
      key: "address",
      label: t("v2.employees.columns.address", "Địa chỉ"),
      value: form.address || "—",
      multiline: true,
    },
  ];

  return (
    <DrawerSection title={t("v2.employees.form.profile", "Thông tin chung")}>
      <V2DrawerRowList rows={rows} />
    </DrawerSection>
  );
}
