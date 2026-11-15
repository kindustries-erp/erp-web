import {
  DrawerSection,
  V2DrawerFieldGrid,
  V2Textarea,
  V2TextField,
  type V2DrawerFieldItem,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import { placeBranchAfter } from "../../../../procurement.branch";
import {
  ProcurementBranchPicker,
  ProcurementDateField,
} from "../../../molecules/procurement-pickers/ProcurementPickers";
import {
  nextNeededDate,
  type ProcurementRequestFormErrors,
  type ProcurementRequestFormValue,
} from "../../../../form/procurementRequest.form";
import { ProcurementRequestHeaderView } from "./ProcurementRequestHeaderView";

export interface ProcurementRequestHeaderSectionProps {
  form: ProcurementRequestFormValue;
  errors: ProcurementRequestFormErrors;
  headerViewing: boolean;
  branchLocked: boolean;
  /** Chi nhánh tùy chọn (Garage): không bắt buộc, bỏ trống được */
  branchOptional?: boolean;
  setField: <K extends keyof ProcurementRequestFormValue>(
    key: K,
    value: ProcurementRequestFormValue[K],
  ) => void;
}

/**
 * Section đầu đề đề nghị mua (cột phải). Sửa: chi nhánh một hàng, hai ngày cùng hàng
 * (ngày cần theo ngày đề nghị khi chưa sửa lệch), rồi nội dung và ghi chú.
 */
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
  const title = t("v2.procurement.sections.header", "Thông tin đề nghị");

  if (headerViewing) {
    return (
      <DrawerSection title={title}>
        <ProcurementRequestHeaderView
          form={form}
          branchOptional={branchOptional}
        />
      </DrawerSection>
    );
  }

  const fields: V2DrawerFieldItem[] = placeBranchAfter(
    [
      {
        key: "branchId",
        label: t("v2.procurement.fields.branch", "Chi nhánh"),
        required: !branchOptional,
        error: errors.branchId ? requiredError : undefined,
        className: "sm:col-span-2",
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
            onChange={(v) => {
              setField(
                "neededDate",
                nextNeededDate(form.requestDate, form.neededDate, v),
              );
              setField("requestDate", v);
            }}
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
        className: "sm:col-span-2",
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
    "neededDate",
    branchOptional,
  );

  return (
    <DrawerSection title={title}>
      <V2DrawerFieldGrid fields={fields} />
    </DrawerSection>
  );
}
