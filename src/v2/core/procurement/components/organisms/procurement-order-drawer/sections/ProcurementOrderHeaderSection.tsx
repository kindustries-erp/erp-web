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

  if (viewing) {
    const rows: DrawerRowConfig[] = [
      {
        key: "branch",
        label: t("v2.procurement.fields.branch", "Chi nhánh"),
        value: form.branchName || "—",
      },
      {
        key: "orderDate",
        label: t("v2.procurement.fields.orderDate", "Ngày đơn"),
        value: form.orderDate || "—",
      },
      {
        key: "supplier",
        label: t("v2.procurement.fields.supplier", "Nhà cung cấp"),
        value: form.supplierName || "—",
      },
      {
        key: "expectedDate",
        label: t("v2.procurement.fields.expectedDate", "Ngày dự kiến nhận"),
        value: form.expectedDate || "—",
      },
      {
        key: "supplierInvoiceNo",
        label: t("v2.procurement.fields.supplierInvoiceNo", "Số hóa đơn NCC"),
        value: form.supplierInvoiceNo || "—",
        copyable: Boolean(form.supplierInvoiceNo),
      },
      {
        key: "remarks",
        label: t("v2.procurement.fields.remarks", "Ghi chú"),
        value: form.remarks || "—",
        multiline: true,
      },
    ];

    return (
      <DrawerSection
        title={t("v2.procurement.sections.header", "Thông tin đơn")}
      >
        <V2DrawerRowList rows={rows} />
      </DrawerSection>
    );
  }

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
          viewing={branchLocked || Boolean(form.requestId)}
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
          viewing={false}
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
          viewing={false}
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
          viewing={false}
          minDate={form.orderDate}
          onChange={(v) => setField("expectedDate", v)}
        />
      ),
    },
    {
      key: "supplierInvoiceNo",
      label: t("v2.procurement.fields.supplierInvoiceNo", "Số hóa đơn NCC"),
      render: () => (
        <V2TextField
          viewing={false}
          value={form.supplierInvoiceNo}
          className={cn("font-mono", V2_DRAWER_FOCUS_RING_CLASS)}
          onChange={(v) => setField("supplierInvoiceNo", v)}
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
  ];

  return (
    <DrawerSection title={t("v2.procurement.sections.header", "Thông tin đơn")}>
      <V2DrawerFieldGrid fields={fields} columns={1} />
    </DrawerSection>
  );
}
