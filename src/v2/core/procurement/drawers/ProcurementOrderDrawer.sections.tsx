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
  ProcurementSupplierPicker,
} from "../components/molecules/procurement-pickers/ProcurementPickers";
import { ProcurementStatusText } from "../columns/procurementColumns";
import { formatProcurementMoney } from "../procurement.rules";
import {
  sumProcurementLines,
  type ProcurementLineFormValue,
} from "../form/procurementLine.form";
import type {
  ProcurementOrderFormErrors,
  ProcurementOrderFormValue,
} from "../form/procurementOrder.form";
import type { ProcurementOrderDetail } from "../procurement.types";

export interface ProcurementOrderSectionsProps {
  form: ProcurementOrderFormValue;
  errors: ProcurementOrderFormErrors;
  viewing: boolean;
  branchLocked: boolean;
  detail?: ProcurementOrderDetail;
  setField: <K extends keyof ProcurementOrderFormValue>(
    key: K,
    value: ProcurementOrderFormValue[K],
  ) => void;
}

const LINES_ERROR_KEY = {
  empty: "v2.procurement.errors.linesEmpty",
  itemName: "v2.procurement.errors.itemName",
  qty: "v2.procurement.errors.qty",
} as const;

/** Phần trái: thông tin đầu đơn và bảng dòng. */
export function ProcurementOrderMainSections(
  props: ProcurementOrderSectionsProps,
) {
  const { t } = useV2Translation();
  const { form, errors, viewing, branchLocked, setField } = props;
  const requiredError = t(
    "v2.procurement.errors.required",
    "Trường này bắt buộc",
  );
  const setLines = (lines: ProcurementLineFormValue[]) =>
    setField("lines", lines);
  const linesError = errors.lines
    ? t(LINES_ERROR_KEY[errors.lines], "Dòng chứng từ chưa hợp lệ")
    : undefined;

  return (
    <div className="space-y-3">
      <DrawerSection
        title={t("v2.procurement.sections.header", "Thông tin đơn")}
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
              viewing={viewing || branchLocked || Boolean(form.requestId)}
              onChange={(id) => setField("branchId", id)}
            />
          </DrawerField>
          <DrawerField
            label={t("v2.procurement.fields.orderDate", "Ngày đơn")}
            required
            error={errors.orderDate ? requiredError : undefined}
          >
            <ProcurementDateField
              value={form.orderDate}
              viewing={viewing}
              onChange={(v) => setField("orderDate", v)}
            />
          </DrawerField>
          <DrawerField
            label={t("v2.procurement.fields.supplier", "Nhà cung cấp")}
          >
            <ProcurementSupplierPicker
              value={form.supplierId}
              label={form.supplierName}
              viewing={viewing}
              onChange={(id, name) => {
                setField("supplierId", id);
                setField("supplierName", name);
              }}
            />
          </DrawerField>
          <DrawerField
            label={t("v2.procurement.fields.expectedDate", "Ngày dự kiến nhận")}
          >
            <ProcurementDateField
              value={form.expectedDate}
              viewing={viewing}
              minDate={form.orderDate}
              onChange={(v) => setField("expectedDate", v)}
            />
          </DrawerField>
          <DrawerField
            label={t(
              "v2.procurement.fields.supplierInvoiceNo",
              "Số hóa đơn NCC",
            )}
          >
            {viewing ? (
              <V2ReadValue value={form.supplierInvoiceNo} />
            ) : (
              <V2TextField
                viewing={false}
                value={form.supplierInvoiceNo}
                onChange={(v) => setField("supplierInvoiceNo", v)}
              />
            )}
          </DrawerField>
          <DrawerField
            label={t("v2.procurement.fields.remarks", "Ghi chú")}
            className="sm:col-span-2"
          >
            {viewing ? (
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
          onChange={setLines}
          viewing={viewing}
          priceLabel={t("v2.procurement.lines.price", "Đơn giá")}
          errorText={linesError}
        />
      </DrawerSection>
    </div>
  );
}

/** Phần phải: tổng quan, trạng thái và thông tin thanh toán (chỉ đọc). */
export function ProcurementOrderSummary({
  form,
  detail,
}: Pick<ProcurementOrderSectionsProps, "form" | "detail">) {
  const { t } = useV2Translation();
  const status = detail?.status ?? "DRAFT";
  return (
    <div className="space-y-3">
      <DrawerSection title={t("v2.procurement.sections.summary", "Tổng quan")}>
        <DrawerRow
          label={t("v2.procurement.columns.total", "Tổng tiền")}
          value={formatProcurementMoney(sumProcurementLines(form.lines))}
        />
        <DrawerRow
          label={t("v2.procurement.columns.approvedTotal", "Tổng đã duyệt")}
          value={formatProcurementMoney(detail?.approvedTotal)}
        />
        <DrawerRow
          label={t("v2.procurement.columns.status", "Trạng thái")}
          value={<ProcurementStatusText value={status} t={t} />}
        />
        <DrawerRow
          label={t("v2.procurement.columns.fulfillment", "Nhận hàng")}
          value={
            <ProcurementStatusText
              value={detail?.fulfillmentStatus ?? "NONE"}
              t={t}
            />
          }
        />
      </DrawerSection>
      <DrawerSection
        title={t("v2.procurement.sections.payment", "Thanh toán")}
        defaultCollapsed
      >
        <DrawerRow
          label={t("v2.procurement.columns.payment", "Thanh toán")}
          value={detail?.paymentStatus ?? "UNPAID"}
        />
        <DrawerRow
          label={t("v2.procurement.columns.createdBy", "Người tạo")}
          value={detail?.createdBy ?? "—"}
        />
        {form.requestId && (
          <DrawerRow
            label={t("v2.procurement.fields.sourceRequest", "Từ đề nghị mua")}
            value={detail?.requestId ?? "—"}
          />
        )}
      </DrawerSection>
    </div>
  );
}
