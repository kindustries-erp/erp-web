import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2FormField } from "@/v2/shared/components/molecules/v2-form-field";
import type { RoleFormValue } from "../../../domain/entities/role";

interface FormProps {
  form: RoleFormValue;
  viewing: boolean;
  errorField: string | null;
  errorMessage: string;
  t: (key: string, fallback?: string) => string;
  setField: <K extends keyof RoleFormValue>(
    key: K,
    value: RoleFormValue[K],
  ) => void;
}

export function RoleFormSections(props: FormProps) {
  const { form, viewing, t, setField } = props;
  return (
    <DrawerSection title={t("v2.rbacRoles.form.identity", "Thông tin chung")}>
      <div className="flex flex-col gap-4">
        <V2FormField
          name="name"
          label={t("v2.rbacRoles.columns.name", "Tên vai trò")}
          type="text"
          required
          viewing={viewing}
          viewMode="stack"
          value={form.name}
          placeholder={t(
            "v2.rbacRoles.form.namePlaceholder",
            "VD: Quản trị viên, Kế toán...",
          )}
          error={props.errorField === "name" ? props.errorMessage : undefined}
          onChange={(v) => setField("name", v)}
        />

        <V2FormField
          name="description"
          label={t("v2.rbacRoles.columns.description", "Mô tả vai trò")}
          type="textarea"
          viewing={viewing}
          viewMode="stack"
          value={form.description}
          placeholder={t(
            "v2.rbacRoles.form.descPlaceholder",
            "Mô tả quyền hạn của vai trò...",
          )}
          error={
            props.errorField === "description" ? props.errorMessage : undefined
          }
          onChange={(v) => setField("description", v)}
        />
      </div>
    </DrawerSection>
  );
}
