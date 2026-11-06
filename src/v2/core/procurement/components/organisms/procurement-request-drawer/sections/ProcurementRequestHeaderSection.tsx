import * as React from "react";
import {
  DrawerSection,
  V2DrawerFieldGrid,
  V2DrawerRowList,
  V2Textarea,
  V2TextField,
  type DrawerRowConfig,
  type V2DrawerFieldItem,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import { placeBranchField } from "../../../../procurement.branch";
import {
  ProcurementBranchPicker,
  ProcurementDateField,
} from "../../../molecules/procurement-pickers/ProcurementPickers";
import type {
  ProcurementRequestFormErrors,
  ProcurementRequestFormValue,
} from "../../../../form/procurementRequest.form";

export interface ProcurementRequestHeaderSectionProps {
  form: ProcurementRequestFormValue;
  errors: ProcurementRequestFormErrors;
  headerViewing: boolean;
  branchLocked: boolean;
  /** Chi nhánh tùy chọn (Garage): không bắt buộc, bỏ trống được, đặt dưới các trường chính */
  branchOptional?: boolean;
  setField: <K extends keyof ProcurementRequestFormValue>(
    key: K,
    value: ProcurementRequestFormValue[K],
  ) => void;
}

/** Section đầu đề đề nghị mua (cột phải): chi nhánh, ngày đề nghị, ngày cần, nội dung, ghi chú. */
export function ProcurementRequestHeaderSection({
  form,
  errors,
  headerViewing,
  branchLocked,
  branchOptional = false,
  setField,
}: ProcurementRequestHeaderSectionProps) {
  const { t } = useV2Translation();
  const requiredError = t(
    "v2.procurement.errors.required",
    "Trường này bắt buộc",
  );

  if (headerViewing) {
    const rows: DrawerRowConfig[] = placeBranchField(
      [
        {
          key: "branch",
          label: t("v2.procurement.fields.branch", "Chi nhánh"),
          value: form.branchName || "—",
        },
        {
          key: "requestDate",
          label: t("v2.procurement.fields.requestDate", "Ngày đề nghị"),
          value: form.requestDate || "—",
        },
        {
          key: "neededDate",
          label: t("v2.procurement.fields.neededDate", "Ngày cần hàng"),
          value: form.neededDate || "—",
        },
        {
          key: "title",
          label: t("v2.procurement.fields.title", "Nội dung"),
          value: form.title || "—",
          multiline: true,
        },
        {
          key: "remarks",
          label: t("v2.procurement.fields.remarks", "Ghi chú"),
          value: form.remarks || "—",
          multiline: true,
        },
      ],
      ["branch"],
      branchOptional,
    );

    return (
      <DrawerSection
        title={t("v2.procurement.sections.header", "Thông tin đề nghị")}
      >
        <V2DrawerRowList rows={rows} />
      </DrawerSection>
    );
  }

  const fields: V2DrawerFieldItem[] = placeBranchField(
    [
      {
        key: "branchId",
        label: t("v2.procurement.fields.branch", "Chi nhánh"),
        required: !branchOptional,
        error: errors.branchId ? requiredError : undefined,
        render: () => (
          <ProcurementBranchPicker
            value={form.branchId}
            label={form.branchName}
            viewing={branchLocked}
            clearable={branchOptional}
            onChange={(id, name) => {
              setField("branchId", id);
              setField("branchName", name);
            }}
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
            viewing={false}
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
            viewing={false}
            minDate={form.requestDate}
            onChange={(v) => setField("neededDate", v)}
          />
        ),
      },
      {
        key: "title",
        label: t("v2.procurement.fields.title", "Nội dung"),
        render: () => (
          <V2TextField
            viewing={false}
            value={form.title}
            className={V2_DRAWER_FOCUS_RING_CLASS}
            onChange={(v) => setField("title", v)}
          />
        ),
      },
      {
        key: "remarks",
        label: t("v2.procurement.fields.remarks", "Ghi chú"),
        className: "sm:col-span-2",
        render: () => (
          <V2Textarea
            className={cn("min-h-20", V2_DRAWER_FOCUS_RING_CLASS)}
            value={form.remarks}
            rows={2}
            onChange={(e) => setField("remarks", e.target.value)}
          />
        ),
      },
    ],
    ["branchId"],
    branchOptional,
  );

  return (
    <DrawerSection
      title={t("v2.procurement.sections.header", "Thông tin đề nghị")}
    >
      <V2DrawerFieldGrid fields={fields} columns={1} />
    </DrawerSection>
  );
}
