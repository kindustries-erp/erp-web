import {
  DrawerField,
  DrawerRow,
  DrawerSection,
  V2ReadValue,
  V2Textarea,
  V2TextField,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { ProcurementLinesEditor } from "../components/organisms/procurement-lines-editor/ProcurementLinesEditor";
import {
  ProcurementBranchPicker,
  ProcurementDateField,
} from "../components/molecules/procurement-pickers/ProcurementPickers";
import { ProcurementStatusText } from "../columns/procurementColumns";
import { formatProcurementMoney } from "../procurement.rules";
import {
  procurementLineAmount,
  sumProcurementLines,
  type ProcurementLineFormValue,
} from "../form/procurementLine.form";
import type {
  ProcurementRequestFormErrors,
  ProcurementRequestFormValue,
} from "../form/procurementRequest.form";
import type { ProcurementRequestDetail } from "../procurement.types";

export interface ProcurementRequestSectionsProps {
  form: ProcurementRequestFormValue;
  errors: ProcurementRequestFormErrors;
  headerViewing: boolean;
  linesViewing: boolean;
  branchLocked: boolean;
  detail?: ProcurementRequestDetail;
  setField: <K extends keyof ProcurementRequestFormValue>(
    key: K,
    value: ProcurementRequestFormValue[K],
  ) => void;
}

const LINES_ERROR_KEY = {
  empty: "v2.procurement.errors.linesEmpty",
  itemName: "v2.procurement.errors.itemName",
  qty: "v2.procurement.errors.qty",
} as const;

/** Phần trái: đầu đề đề nghị (chỉ nhập lúc tạo) và dòng hàng. */
export function ProcurementRequestMainSections(
  props: ProcurementRequestSectionsProps,
) {
  const { t } = useV2Translation();
  const { form, errors, headerViewing, linesViewing, branchLocked, setField } =
    props;
  const requiredError = t(
    "v2.procurement.errors.required",
    "Trường này bắt buộc",
  );
  const linesError = errors.lines
    ? t(LINES_ERROR_KEY[errors.lines], "Dòng chứng từ chưa hợp lệ")
    : undefined;

  return (
    <div className="space-y-3">
      <DrawerSection
        title={t("v2.procurement.sections.header", "Thông tin đề nghị")}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DrawerField
            label={t("v2.procurement.fields.branch", "Chi nhánh")}
            required
            error={errors.branchId ? requiredError : undefined}
          >
            <ProcurementBranchPicker
              value={form.branchId}
              label={form.branchName}
              viewing={headerViewing || branchLocked}
              onChange={(id) => setField("branchId", id)}
            />
          </DrawerField>
          <DrawerField
            label={t("v2.procurement.fields.requestDate", "Ngày đề nghị")}
            required
            error={errors.requestDate ? requiredError : undefined}
          >
            <ProcurementDateField
              value={form.requestDate}
              viewing={headerViewing}
              onChange={(v) => setField("requestDate", v)}
            />
          </DrawerField>
          <DrawerField
            label={t("v2.procurement.fields.neededDate", "Ngày cần hàng")}
          >
            <ProcurementDateField
              value={form.neededDate}
              viewing={headerViewing}
              minDate={form.requestDate}
              onChange={(v) => setField("neededDate", v)}
            />
          </DrawerField>
          <DrawerField label={t("v2.procurement.fields.title", "Nội dung")}>
            {headerViewing ? (
              <V2ReadValue value={form.title} />
            ) : (
              <V2TextField
                viewing={false}
                value={form.title}
                onChange={(v) => setField("title", v)}
              />
            )}
          </DrawerField>
          <DrawerField
            label={t("v2.procurement.fields.remarks", "Ghi chú")}
            className="sm:col-span-2"
          >
            {headerViewing ? (
              <V2ReadValue value={form.remarks} />
            ) : (
              <V2Textarea
                value={form.remarks}
                rows={2}
                onChange={(e) => setField("remarks", e.target.value)}
              />
            )}
          </DrawerField>
        </div>
      </DrawerSection>

      <DrawerSection
        title={t("v2.procurement.sections.lines", "Dòng hàng")}
        count={form.lines.length}
      >
        <ProcurementLinesEditor
          lines={form.lines}
          onChange={(lines: ProcurementLineFormValue[]) =>
            setField("lines", lines)
          }
          viewing={linesViewing}
          priceLabel={t("v2.procurement.lines.estPrice", "Đơn giá dự kiến")}
          errorText={linesError}
        />
      </DrawerSection>
    </div>
  );
}

/** Phần phải: tổng dự kiến, trạng thái đặt hàng và người tạo. */
export function ProcurementRequestSummary({
  form,
  detail,
}: Pick<ProcurementRequestSectionsProps, "form" | "detail">) {
  const { t } = useV2Translation();
  const estimated = sumProcurementLines(form.lines);
  const hasPrice = form.lines.some((l) => procurementLineAmount(l) !== null);
  return (
    <div className="space-y-3">
      <DrawerSection title={t("v2.procurement.sections.summary", "Tổng quan")}>
        <DrawerRow
          label={t("v2.procurement.columns.estimatedTotal", "Tổng dự kiến")}
          value={hasPrice ? formatProcurementMoney(estimated) : "—"}
        />
        <DrawerRow
          label={t("v2.procurement.columns.status", "Trạng thái")}
          value={
            <ProcurementStatusText value={detail?.status ?? "DRAFT"} t={t} />
          }
        />
        <DrawerRow
          label={t("v2.procurement.columns.ordering", "Tiến độ đặt")}
          value={
            <ProcurementStatusText
              value={detail?.orderingStatus ?? "NONE"}
              t={t}
            />
          }
        />
        <DrawerRow
          label={t("v2.procurement.columns.createdBy", "Người tạo")}
          value={detail?.createdBy ?? "—"}
        />
      </DrawerSection>
    </div>
  );
}
