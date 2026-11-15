import {
  DrawerField,
  DrawerSection,
  V2DatePicker,
  V2TextField as TextInput,
} from "@/v2/shared/components";
import type { EmployeeFormError } from "../../../domain/rules/employeeRules";
import type { EmployeeFormProps } from "./EmployeeForm.type";
import { fieldError } from "./EmployeeForm.helpers";
import { EmployeeProfileView } from "./EmployeeProfileView";

/** Khối thông tin chung: view mode render thông tin, edit/create render ô nhập */
export function EmployeeProfileSection(props: EmployeeFormProps) {
  const { form, viewing, creating, t, setField, error } = props;
  if (viewing) {
    return (
      <EmployeeProfileView
        form={form}
        nationalIdMasked={props.nationalIdMasked}
        t={t}
      />
    );
  }
  const err = (key: EmployeeFormError) => fieldError(t, error, key);
  return (
    <DrawerSection title={t("v2.employees.form.profile", "Thông tin chung")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <DrawerField label={t("v2.employees.columns.employeeCode", "Mã")}>
          <TextInput
            viewing={false}
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
            viewing={false}
            value={form.fullName}
            onChange={(v) => setField("fullName", v)}
          />
        </DrawerField>
        <DrawerField label={t("v2.employees.columns.phone", "Điện thoại")}>
          <TextInput
            viewing={false}
            value={form.phone}
            onChange={(v) => setField("phone", v)}
          />
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.email", "Email")}
          error={err("invalidEmail")}
        >
          <TextInput
            viewing={false}
            value={form.email}
            type="email"
            onChange={(v) => setField("email", v)}
          />
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.birthDate", "Ngày sinh")}
          error={err("futureBirthDate")}
        >
          <V2DatePicker
            value={form.birthDate || null}
            onValueChange={(v) => setField("birthDate", v ?? "")}
          />
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.nationalId", "CCCD")}
          error={err("invalidNationalId")}
        >
          <TextInput
            viewing={false}
            value={form.nationalId}
            onChange={(v) => setField("nationalId", v.replace(/\s/g, ""))}
          />
        </DrawerField>
        <DrawerField
          label={t("v2.employees.columns.address", "Địa chỉ")}
          className="sm:col-span-2"
        >
          <TextInput
            viewing={false}
            value={form.address}
            onChange={(v) => setField("address", v)}
          />
        </DrawerField>
      </div>
    </DrawerSection>
  );
}
