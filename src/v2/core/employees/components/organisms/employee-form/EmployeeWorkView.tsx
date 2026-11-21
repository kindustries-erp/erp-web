import {
  DrawerSection,
  V2DrawerRowList,
  type DrawerRowConfig,
} from "@/v2/shared/components";
import { EmployeeStatusBadge } from "../../molecules/employee-status-badge";
import type { EmployeeFormProps } from "./EmployeeForm.type";
import { viewDate } from "./EmployeeForm.helpers";

/** Chế độ xem công việc: hiển thị nhãn - giá trị, không render ô nhập. */
export function EmployeeWorkView({
  form,
  branchOptions,
  branchFallbackLabel,
  t,
}: Pick<
  EmployeeFormProps,
  "form" | "branchOptions" | "branchFallbackLabel" | "t"
>) {
  const branchLabel =
    branchOptions.find((o) => o.value === form.branchId)?.label ??
    branchFallbackLabel;
  const rows: DrawerRowConfig[] = [
    {
      key: "jobTitle",
      label: t("v2.employees.columns.jobTitle", "Chức danh"),
      value: form.jobTitle || "—",
    },
    {
      key: "department",
      label: t("v2.employees.columns.department", "Phòng ban"),
      value: form.department || "—",
    },
    {
      key: "branch",
      label: t("v2.employees.columns.branch", "Chi nhánh"),
      value: branchLabel || "—",
    },
    {
      key: "status",
      label: t("v2.employees.columns.status", "Trạng thái"),
      value: <EmployeeStatusBadge status={form.status} />,
    },
    {
      key: "startDate",
      label: t("v2.employees.columns.startDate", "Ngày vào làm"),
      value: viewDate(form.startDate) || "—",
    },
    {
      key: "leaveDate",
      label: t("v2.employees.columns.leaveDate", "Ngày nghỉ việc"),
      value: viewDate(form.leaveDate) || "—",
    },
    {
      key: "notes",
      label: t("v2.employees.columns.notes", "Ghi chú"),
      value: form.notes || "—",
      multiline: true,
    },
  ];

  return (
    <DrawerSection title={t("v2.employees.form.work", "Công việc")}>
      <V2DrawerRowList rows={rows} />
    </DrawerSection>
  );
}
