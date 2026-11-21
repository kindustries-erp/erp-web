import {
  DrawerField,
  DrawerSection,
  V2Combobox,
  V2DatePicker,
  V2TextField as TextInput,
} from "@/v2/shared/components";
import type { EmployeeFormProps } from "./EmployeeForm.type";
import { fieldError } from "./EmployeeForm.helpers";
import { EmployeeWorkView } from "./EmployeeWorkView";

/** Khối công việc: view mode render thông tin, edit/create render ô nhập */
export function EmployeeWorkSection(props: EmployeeFormProps) {
  const { form, viewing, t, setField, error } = props;
  if (viewing) {
    return (
      <EmployeeWorkView
        form={form}
        branchOptions={props.branchOptions}
        branchFallbackLabel={props.branchFallbackLabel}
        t={t}
      />
    );
  }
  return (
    <DrawerSection title={t("v2.employees.form.work", "Công việc")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <DrawerField label={t("v2.employees.columns.jobTitle", "Chức danh")}>
          <TextInput
            viewing={false}
            value={form.jobTitle}
            onChange={(v) => setField("jobTitle", v)}
          />
        </DrawerField>
        <DrawerField label={t("v2.employees.columns.department", "Phòng ban")}>
          <TextInput
            viewing={false}
            value={form.department}
            onChange={(v) => setField("department", v)}
          />
        </DrawerField>
        <DrawerField label={t("v2.employees.columns.branch", "Chi nhánh")}>
          <V2Combobox
            clearable
            value={form.branchId}
            loading={props.branchLoading}
            fallbackLabel={props.branchFallbackLabel}
            placeholder={t("v2.employees.form.noBranch", "Chưa chọn")}
            onValueChange={(v) => setField("branchId", v ?? "")}
            options={props.branchOptions}
          />
        </DrawerField>
        <DrawerField label={t("v2.employees.columns.status", "Trạng thái")}>
          <V2Combobox
            searchable={false}
            clearable={false}
            value={form.status}
            onValueChange={(v) =>
              setField("status", v === "INACTIVE" ? "INACTIVE" : "ACTIVE")
            }
            options={[
              {
                value: "ACTIVE",
                label: t("v2.employees.status.active", "Đang làm"),
              },
              {
                value: "INACTIVE",
                label: t("v2.employees.status.inactive", "Nghỉ việc"),
              },
            ]}
          />
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.startDate", "Ngày vào làm")}
        >
          <V2DatePicker
            value={form.startDate || null}
            onValueChange={(v) => setField("startDate", v ?? "")}
          />
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.leaveDate", "Ngày nghỉ việc")}
          error={fieldError(t, error, "leaveBeforeStart")}
        >
          <V2DatePicker
            value={form.leaveDate || null}
            onValueChange={(v) => setField("leaveDate", v ?? "")}
          />
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.notes", "Ghi chú")}
          className="sm:col-span-2"
        >
          <TextInput
            viewing={false}
            value={form.notes}
            onChange={(v) => setField("notes", v)}
          />
        </DrawerField>
      </div>
    </DrawerSection>
  );
}
