import {
  DrawerField,
  DrawerSection,
  V2DatePicker,
  V2ReadValue as ReadValue,
  V2TextField as TextInput,
} from "@/v2/shared/components";
import type { EmployeeFormError } from "../../../domain/rules/employeeRules";
import type { EmployeeFormProps } from "./EmployeeForm.type";
import { fieldError, viewDate } from "./EmployeeForm.helpers";

/** Khối thông tin chung: mã, họ tên, liên hệ, CCCD, ngày sinh, địa chỉ */
export function EmployeeProfileSection(props: EmployeeFormProps) {
  const { form, viewing, creating, t, setField, error } = props;
  const err = (key: EmployeeFormError) => fieldError(t, error, key);
  return (
    <DrawerSection title={t("v2.employees.form.profile", "Thông tin chung")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <DrawerField label={t("v2.employees.columns.employeeCode", "Mã")}>
          <TextInput
            viewing={viewing}
            value={form.employeeCode}
            placeholder={
              creating
                ? t("v2.employees.form.codeAuto", "Tự sinh nếu để trống")
                : undefined
            }
            disabled={!creating}
            onChange={(v) => setField("employeeCode", v)}
          />
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.fullName", "Họ tên")}
          required
          error={err("requiredFullName")}
        >
          <TextInput
            viewing={viewing}
            value={form.fullName}
            onChange={(v) => setField("fullName", v)}
          />
        </DrawerField>
        <DrawerField label={t("v2.employees.columns.phone", "Điện thoại")}>
          <TextInput
            viewing={viewing}
            value={form.phone}
            onChange={(v) => setField("phone", v)}
          />
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.email", "Email")}
          error={err("invalidEmail")}
        >
          <TextInput
            viewing={viewing}
            value={form.email}
            type="email"
            onChange={(v) => setField("email", v)}
          />
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.birthDate", "Ngày sinh")}
          error={err("futureBirthDate")}
        >
          {viewing ? (
            <ReadValue value={viewDate(form.birthDate)} />
          ) : (
            <V2DatePicker
              value={form.birthDate || null}
              onValueChange={(v) => setField("birthDate", v ?? "")}
            />
          )}
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.nationalId", "CCCD")}
          error={err("invalidNationalId")}
        >
          {viewing ? (
            <ReadValue value={props.nationalIdMasked ?? ""} />
          ) : (
            <TextInput
              viewing={false}
              value={form.nationalId}
              onChange={(v) => setField("nationalId", v.replace(/\s/g, ""))}
            />
          )}
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.address", "Địa chỉ")}
          className="sm:col-span-2"
        >
          <TextInput
            viewing={viewing}
            value={form.address}
            onChange={(v) => setField("address", v)}
          />
        </DrawerField>
      </div>
    </DrawerSection>
  );
}
