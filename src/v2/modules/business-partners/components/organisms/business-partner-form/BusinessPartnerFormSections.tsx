import { RotateCw } from "lucide-react";
import { V2Button, V2Textarea } from "@/v2/shared/components/atoms";
import { DrawerField } from "@/v2/shared/components/molecules/v2-drawer-field";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import type { BusinessPartnerFormValue } from "../../../domain/entities/businessPartner";
import {
  V2ReadValue as ReadValue,
  V2TextField as TextInput,
} from "@/v2/shared/components/molecules/v2-form-controls";

interface FormProps {
  form: BusinessPartnerFormValue;
  viewing: boolean;
  codeEditable: boolean;
  nameError: string;
  t: (key: string, fallback?: string) => string;
  setField: <K extends keyof BusinessPartnerFormValue>(
    key: K,
    value: BusinessPartnerFormValue[K],
  ) => void;
  onRegenerateCode: () => void;
}

export function BusinessPartnerFormSections(props: FormProps) {
  const { form, viewing, nameError, t, setField } = props;
  return (
    <div className="space-y-3">
      <DrawerSection
        title={t("v2.partners.form.identity", "Thông tin định danh")}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DrawerField label={t("v2.partners.columns.code", "Mã đối tác")}>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <TextInput
                  viewing={viewing}
                  value={form.code}
                  className="font-mono"
                  disabled={!props.codeEditable}
                  onChange={(v) => setField("code", v.toUpperCase())}
                />
              </div>
              {!viewing && props.codeEditable && (
                <V2Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={t("v2.partners.form.generateCode", "Sinh mã mới")}
                  onClick={props.onRegenerateCode}
                >
                  <RotateCw className="h-4 w-4" />
                </V2Button>
              )}
            </div>
          </DrawerField>
          <DrawerField
            label={t("v2.partners.form.legalName", "Tên pháp nhân")}
            required
            error={nameError}
          >
            <TextInput
              viewing={viewing}
              value={form.name}
              onChange={(v) => setField("name", v)}
            />
          </DrawerField>
          <DrawerField
            label={t("v2.partners.columns.displayName", "Tên hiển thị")}
          >
            <TextInput
              viewing={viewing}
              value={form.displayName}
              onChange={(v) => setField("displayName", v)}
            />
          </DrawerField>
          <DrawerField label={t("v2.partners.columns.taxCode", "Mã số thuế")}>
            <TextInput
              viewing={viewing}
              value={form.taxCode}
              className="font-mono"
              onChange={(v) => setField("taxCode", v)}
            />
          </DrawerField>
        </div>
      </DrawerSection>
      <DrawerSection title={t("v2.partners.form.contact", "Liên hệ & địa chỉ")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <DrawerField
            label={t("v2.partners.columns.contactName", "Người liên hệ")}
          >
            <TextInput
              viewing={viewing}
              value={form.contactName}
              onChange={(v) => setField("contactName", v)}
            />
          </DrawerField>
          <DrawerField label={t("v2.partners.columns.phone", "Điện thoại")}>
            <TextInput
              viewing={viewing}
              value={form.phone}
              className="font-mono"
              onChange={(v) => setField("phone", v)}
            />
          </DrawerField>
          <DrawerField
            label={t("v2.partners.columns.email", "Email")}
            className="sm:col-span-2"
          >
            <TextInput
              viewing={viewing}
              value={form.email}
              type="email"
              onChange={(v) => setField("email", v)}
            />
          </DrawerField>
          <DrawerField
            label={t("v2.partners.columns.address", "Địa chỉ")}
            className="sm:col-span-2"
          >
            {viewing ? (
              <ReadValue value={form.address} />
            ) : (
              <V2Textarea
                className="min-h-20"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
              />
            )}
          </DrawerField>
        </div>
      </DrawerSection>
      <DrawerSection
        title={t("v2.partners.form.configuration", "Trạng thái & ghi chú")}
      >
        <DrawerField label={t("v2.partners.columns.status", "Trạng thái")}>
          {viewing ? (
            <ReadValue
              value={
                form.status === "ACTIVE"
                  ? t("v2.partners.status.active", "Hoạt động")
                  : t("v2.partners.status.inactive", "Ngưng hoạt động")
              }
            />
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
                  label: t("v2.partners.status.active", "Hoạt động"),
                },
                {
                  value: "INACTIVE",
                  label: t("v2.partners.status.inactive", "Ngưng hoạt động"),
                },
              ]}
            />
          )}
        </DrawerField>
        <DrawerField label={t("v2.partners.form.notes", "Ghi chú")}>
          {viewing ? (
            <ReadValue value={form.notes} />
          ) : (
            <V2Textarea
              className="min-h-20"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
            />
          )}
        </DrawerField>
      </DrawerSection>
    </div>
  );
}
