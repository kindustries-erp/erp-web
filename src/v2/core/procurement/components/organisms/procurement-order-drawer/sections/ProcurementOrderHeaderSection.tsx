import {
  DrawerSection,
  V2DrawerFieldGrid,
  V2ReadValue,
  V2Textarea,
  V2TextField,
  type V2DrawerFieldItem,
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

/** Section đầu đơn mua (cột phải): chi nhánh, ngày đơn, NCC, ngày dự kiến, số HĐ NCC, ghi chú. */
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

  const fields: V2DrawerFieldItem[] = [
    {
      key: "branchId",
      label: t("v2.procurement.fields.branch", "Chi nhánh"),
      required: true,
      error: errors.branchId ? requiredError : undefined,
      render: () => (
        <ProcurementBranchPicker
          value={form.branchId}
          label={form.branchName}
          viewing={viewing || branchLocked || Boolean(form.requestId)}
          onChange={(id) => setField("branchId", id)}
        />
      ),
    },
    {
      key: "orderDate",
      label: t("v2.procurement.fields.orderDate", "Ngày đơn"),
      required: true,
      error: errors.orderDate ? requiredError : undefined,
      render: () => (
        <ProcurementDateField
          value={form.orderDate}
          viewing={viewing}
          onChange={(v) => setField("orderDate", v)}
        />
      ),
    },
    {
      key: "supplierId",
      label: t("v2.procurement.fields.supplier", "Nhà cung cấp"),
      render: () => (
        <ProcurementSupplierPicker
          value={form.supplierId}
          label={form.supplierName}
          viewing={viewing}
          onChange={(id, name) => {
            setField("supplierId", id);
            setField("supplierName", name);
          }}
        />
      ),
    },
    {
      key: "expectedDate",
      label: t("v2.procurement.fields.expectedDate", "Ngày dự kiến nhận"),
      render: () => (
        <ProcurementDateField
          value={form.expectedDate}
          viewing={viewing}
          minDate={form.orderDate}
          onChange={(v) => setField("expectedDate", v)}
        />
      ),
    },
    {
      key: "supplierInvoiceNo",
      label: t("v2.procurement.fields.supplierInvoiceNo", "Số hóa đơn NCC"),
      render: () =>
        viewing ? (
          <V2ReadValue value={form.supplierInvoiceNo} />
        ) : (
          <V2TextField
            viewing={false}
            value={form.supplierInvoiceNo}
            onChange={(v) => setField("supplierInvoiceNo", v)}
          />
        ),
    },
    {
      key: "remarks",
      label: t("v2.procurement.fields.remarks", "Ghi chú"),
      className: "sm:col-span-2",
      render: () =>
        viewing ? (
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
    <DrawerSection title={t("v2.procurement.sections.header", "Thông tin đơn")}>
      {/* Đầu đơn nằm ở cột phải (một cột), giống phiếu nhập kho */}
      <V2DrawerFieldGrid fields={fields} columns={1} />
    </DrawerSection>
  );
}
