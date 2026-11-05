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
  ProcurementSupplierPicker,
} from "../../../molecules/procurement-pickers/ProcurementPickers";
import type {
  ProcurementOrderFormErrors,
  ProcurementOrderFormValue,
} from "../../../../form/procurementOrder.form";

export interface ProcurementOrderHeaderSectionProps {
  form: ProcurementOrderFormValue;
  errors: ProcurementOrderFormErrors;
  viewing: boolean;
  branchLocked: boolean;
  setField: <K extends keyof ProcurementOrderFormValue>(
    key: K,
    value: ProcurementOrderFormValue[K],
  ) => void;
}

/** Section thông tin đơn mua: chi nhánh, ngày đơn, NCC, ngày dự kiến, số HĐ NCC, ghi chú. */
export function ProcurementOrderHeaderSection({
  form,
  errors,
  viewing,
  branchLocked,
  setField,
}: ProcurementOrderHeaderSectionProps) {
  const { t } = useV2Translation();
  const requiredError = t(
    "v2.procurement.errors.required",
    "Trường này bắt buộc",
  );

  return (
    <DrawerSection title={t("v2.procurement.sections.header", "Thông tin đơn")}>
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
          label={t("v2.procurement.fields.supplierInvoiceNo", "Số hóa đơn NCC")}
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
  );
}
