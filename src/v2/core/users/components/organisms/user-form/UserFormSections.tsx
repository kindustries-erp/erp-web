import {
  DrawerField,
  DrawerSection,
  V2Combobox,
  V2TextField as TextInput,
} from "@/v2/shared/components";
import type { UserFormValue } from "../../../domain/user";
import { UserFormView } from "./UserFormView";

export interface UserEmployeeChoice {
  value: string;
  label: string;
}

interface FormProps {
  form: UserFormValue;
  viewing: boolean;
  emailEditable: boolean;
  creating: boolean;
  emailError: string;
  passwordError: string;
  employeeOptions: UserEmployeeChoice[];
  employeeLoading: boolean;
  /** Nhãn nhân viên hiện đang liên kết, dùng khi chưa có trong danh sách chọn */
  employeeFallbackLabel?: string;
  t: (key: string, fallback?: string) => string;
  setField: <K extends keyof UserFormValue>(
    key: K,
    value: UserFormValue[K],
  ) => void;
}

/** View mode render thông tin (`UserFormView`); edit/create render ô nhập. */
export function UserFormSections(props: FormProps) {
  const { form, viewing, creating, t, setField } = props;
  const employeeLabel =
    props.employeeOptions.find((option) => option.value === form.employeeId)
      ?.label ?? props.employeeFallbackLabel;

  if (viewing) {
    return <UserFormView form={form} employeeLabel={employeeLabel} t={t} />;
  }

  return (
    <div className="space-y-3">
      <DrawerSection title={t("v2.users.form.account", "Tài khoản")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <DrawerField
            label={t("v2.users.columns.email", "Email")}
            required={creating}
            error={props.emailError}
            className="sm:col-span-2"
          >
            <TextInput
              viewing={false}
              value={form.email}
              type="email"
              disabled={!props.emailEditable}
              onChange={(v) => setField("email", v)}
            />
          </DrawerField>
          {creating && (
            <DrawerField
              label={t("v2.users.form.password", "Mật khẩu")}
              required
              error={props.passwordError}
              className="sm:col-span-2"
            >
              <TextInput
                viewing={false}
                value={form.password}
                type="password"
                onChange={(v) => setField("password", v)}
              />
            </DrawerField>
          )}
        </div>
      </DrawerSection>
      <DrawerSection title={t("v2.users.form.link", "Liên kết & trạng thái")}>
        <DrawerField label={t("v2.users.columns.employee", "Nhân viên")}>
          <V2Combobox
            clearable
            value={form.employeeId}
            loading={props.employeeLoading}
            fallbackLabel={props.employeeFallbackLabel}
            placeholder={t("v2.users.form.noEmployee", "Không liên kết")}
            onValueChange={(v) => setField("employeeId", v ?? "")}
            options={props.employeeOptions}
          />
        </DrawerField>
        <DrawerField label={t("v2.users.columns.status", "Trạng thái")}>
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
                label: t("v2.users.status.active", "Hoạt động"),
              },
              {
                value: "INACTIVE",
                label: t("v2.users.status.inactive", "Ngưng hoạt động"),
              },
            ]}
          />
        </DrawerField>
      </DrawerSection>
    </div>
  );
}
