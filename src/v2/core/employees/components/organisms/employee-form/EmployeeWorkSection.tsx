import {
  DrawerField,
  DrawerSection,
  V2Combobox,
  V2DatePicker,
  V2ReadValue as ReadValue,
  V2TextField as TextInput,
} from "@/v2/shared/components";
import type { EmployeeFormProps } from "./EmployeeForm.type";
import { fieldError, viewDate } from "./EmployeeForm.helpers";

/** Khối công việc: chức danh, phòng ban, chi nhánh, ngày vào/nghỉ, trạng thái, ghi chú */
export function EmployeeWorkSection(props: EmployeeFormProps) {
  const { form, viewing, t, setField, error } = props;
  const branchLabel =
    props.branchOptions.find((o) => o.value === form.branchId)?.label ??
    props.branchFallbackLabel ??
    "";
  const statusLabel =
    form.status === "ACTIVE"
      ? t("v2.employees.status.active", "Đang làm")
      : t("v2.employees.status.inactive", "Nghỉ việc");
  return (
    <DrawerSection title={t("v2.employees.form.work", "Công việc")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <DrawerField label={t("v2.employees.columns.jobTitle", "Chức danh")}>
          <TextInput
            viewing={viewing}
            value={form.jobTitle}
            onChange={(v) => setField("jobTitle", v)}
          />
        </DrawerField>
        <DrawerField label={t("v2.employees.columns.department", "Phòng ban")}>
          <TextInput
            viewing={viewing}
            value={form.department}
            onChange={(v) => setField("department", v)}
          />
        </DrawerField>
        <DrawerField label={t("v2.employees.columns.branch", "Chi nhánh")}>
          {viewing ? (
            <ReadValue value={branchLabel} />
          ) : (
            <V2Combobox
              clearable
              value={form.branchId}
              loading={props.branchLoading}
              fallbackLabel={props.branchFallbackLabel}
              placeholder={t("v2.employees.form.noBranch", "Chưa chọn")}
              onValueChange={(v) => setField("branchId", v ?? "")}
              options={props.branchOptions}
            />
          )}
        </DrawerField>
        <DrawerField label={t("v2.employees.columns.status", "Trạng thái")}>
          {viewing ? (
            <ReadValue value={statusLabel} />
          ) : (
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
          )}
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.startDate", "Ngày vào làm")}
        >
          {viewing ? (
            <ReadValue value={viewDate(form.startDate)} />
          ) : (
            <V2DatePicker
              value={form.startDate || null}
              onValueChange={(v) => setField("startDate", v ?? "")}
            />
          )}
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.leaveDate", "Ngày nghỉ việc")}
          error={fieldError(t, error, "leaveBeforeStart")}
        >
          {viewing ? (
            <ReadValue value={viewDate(form.leaveDate)} />
          ) : (
            <V2DatePicker
              value={form.leaveDate || null}
              onValueChange={(v) => setField("leaveDate", v ?? "")}
            />
          )}
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.notes", "Ghi chú")}
          className="sm:col-span-2"
        >
          <TextInput
            viewing={viewing}
            value={form.notes}
            onChange={(v) => setField("notes", v)}
          />
        </DrawerField>
      </div>
    </DrawerSection>
  );
}
