import * as React from "react";
import {
  DrawerField,
  DrawerSection,
  V2ReadValue,
  V2Textarea,
  V2TextField,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  ProcurementBranchPicker,
  ProcurementDateField,
} from "../../components/molecules/procurement-pickers/ProcurementPickers";
import type {
  ProcurementRequestFormErrors,
  ProcurementRequestFormValue,
} from "../../form/procurementRequest.form";

export interface ProcurementRequestHeaderSectionProps {
  form: ProcurementRequestFormValue;
  errors: ProcurementRequestFormErrors;
  headerViewing: boolean;
  branchLocked: boolean;
  setField: <K extends keyof ProcurementRequestFormValue>(
    key: K,
    value: ProcurementRequestFormValue[K],
  ) => void;
}

interface HeaderFieldConfig {
  key: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  render: () => React.ReactNode;
}

/** Section thông tin đề nghị mua: chi nhánh, ngày đề nghị, ngày cần, nội dung, ghi chú (array config). */
export function ProcurementRequestHeaderSection({
  form,
  errors,
  headerViewing,
  branchLocked,
  setField,
}: ProcurementRequestHeaderSectionProps) {
  const { t } = useV2Translation();
  const requiredError = t(
    "v2.procurement.errors.required",
    "Trường này bắt buộc",
  );

  const fields: HeaderFieldConfig[] = [
    {
      key: "branchId",
      label: t("v2.procurement.fields.branch", "Chi nhánh"),
      required: true,
      error: errors.branchId ? requiredError : undefined,
      render: () => (
        <ProcurementBranchPicker
          value={form.branchId}
          label={form.branchName}
          viewing={headerViewing || branchLocked}
          onChange={(id) => setField("branchId", id)}
        />
      ),
    },
    {
      key: "requestDate",
      label: t("v2.procurement.fields.requestDate", "Ngày đề nghị"),
      required: true,
      error: errors.requestDate ? requiredError : undefined,
      render: () => (
        <ProcurementDateField
          value={form.requestDate}
          viewing={headerViewing}
          onChange={(v) => setField("requestDate", v)}
        />
      ),
    },
    {
      key: "neededDate",
      label: t("v2.procurement.fields.neededDate", "Ngày cần hàng"),
      render: () => (
        <ProcurementDateField
          value={form.neededDate}
          viewing={headerViewing}
          minDate={form.requestDate}
          onChange={(v) => setField("neededDate", v)}
        />
      ),
    },
    {
      key: "title",
      label: t("v2.procurement.fields.title", "Nội dung"),
      render: () =>
        headerViewing ? (
          <V2ReadValue value={form.title} />
        ) : (
          <V2TextField
            viewing={false}
            value={form.title}
            onChange={(v) => setField("title", v)}
          />
        ),
    },
    {
      key: "remarks",
      label: t("v2.procurement.fields.remarks", "Ghi chú"),
      className: "sm:col-span-2",
      render: () =>
        headerViewing ? (
          <V2ReadValue value={form.remarks} />
        ) : (
          <V2Textarea
            value={form.remarks}
            rows={2}
            onChange={(e) => setField("remarks", e.target.value)}
          />
        ),
    },
  ];

  return (
    <DrawerSection
      title={t("v2.procurement.sections.header", "Thông tin đề nghị")}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <DrawerField
            key={f.key}
            label={f.label}
            required={f.required}
            error={f.error}
            className={f.className}
          >
            {f.render()}
          </DrawerField>
        ))}
      </div>
    </DrawerSection>
  );
}
