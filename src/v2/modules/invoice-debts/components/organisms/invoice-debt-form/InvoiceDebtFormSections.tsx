import { DrawerField } from "@/v2/shared/components/molecules/v2-drawer-field";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import {
  V2ReadValue,
  V2TextField,
} from "@/v2/shared/components/molecules/v2-form-controls";
import type { InvoiceDebtFormValue } from "../../../domain/entities/invoiceDebt";

interface FormProps {
  form: InvoiceDebtFormValue;
  viewing: boolean;
  errorField: string | null;
  errorMessage: string;
  t: (key: string, fallback?: string) => string;
  setField: <K extends keyof InvoiceDebtFormValue>(
    key: K,
    value: InvoiceDebtFormValue[K],
  ) => void;
}

export function InvoiceDebtFormSections(props: FormProps) {
  const { form, viewing, t, setField } = props;
  return (
    <DrawerSection title={t("v2.invoiceDebts.form.identity", "Thông tin")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <DrawerField
          label={t("v2.invoiceDebts.columns.search", "search")}
          required
          error={props.errorField === "search" ? props.errorMessage : undefined}
        >
          <V2TextField
            viewing={viewing}
            value={form.search}
            onChange={(v) => setField("search", v)}
          />
        </DrawerField>
        <DrawerField
          label={t("v2.invoiceDebts.columns.partnerType", "partnerType")}
          error={
            props.errorField === "partnerType" ? props.errorMessage : undefined
          }
        >
          {viewing ? (
            <V2ReadValue
              value={
                form.partnerType === "INACTIVE"
                  ? t("v2.invoiceDebts.status.inactive", "Ngưng hoạt động")
                  : t("v2.invoiceDebts.status.active", "Hoạt động")
              }
            />
          ) : (
            <V2Combobox
              searchable={false}
              clearable={false}
              value={form.partnerType}
              onValueChange={(v) =>
                setField(
                  "partnerType",
                  v === "INACTIVE" ? "INACTIVE" : "ACTIVE",
                )
              }
              options={[
                {
                  value: "ACTIVE",
                  label: t("v2.invoiceDebts.status.active", "Hoạt động"),
                },
                {
                  value: "INACTIVE",
                  label: t(
                    "v2.invoiceDebts.status.inactive",
                    "Ngưng hoạt động",
                  ),
                },
              ]}
            />
          )}
        </DrawerField>
      </div>
    </DrawerSection>
  );
}
