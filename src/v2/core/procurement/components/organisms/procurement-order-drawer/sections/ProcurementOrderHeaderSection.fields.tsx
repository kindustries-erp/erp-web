import {
  V2Textarea,
  V2TextField,
  type V2DrawerFieldItem,
} from "@/v2/shared/components";
import { cn } from "@/v2/shared/utils/cn";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import {
  GARAGE_ORDER_EDIT_KEYS,
  orderByKeys,
} from "../../../../procurement.branch";
import type { ProcurementOrderFormValue } from "../../../../form/procurementOrder.form";
import {
  applyInvoiceCleared,
  applyInvoiceSelection,
  applyTypedSupplier,
} from "../../../../form/procurementOrder.supplier";
import {
  ProcurementBranchPicker,
  ProcurementDateField,
  ProcurementRequestPicker,
  ProcurementSupplierPicker,
} from "../../../molecules/procurement-pickers/ProcurementPickers";
import { ProcurementInvoicePicker } from "../../../molecules/procurement-pickers/ProcurementInvoicePicker";
import type { ProcurementApi } from "../../../../procurement.types";

type Translate = (key: string, fallback: string) => string;

export interface OrderEditFieldsInput {
  form: ProcurementOrderFormValue;
  errors: { branchId?: boolean; orderDate?: boolean };
  branchLocked: boolean;
  branchOptional: boolean;
  /** Ô số hóa đơn là combobox (Garage, có quyền đọc hóa đơn) */
  invoicePicker: boolean;
  canPickRequest: boolean;
  requestLabel: string;
  requestApi?: ProcurementApi<unknown>;
  onPickRequest?: (requestId: string | null) => void;
  setField: <K extends keyof ProcurementOrderFormValue>(
    key: K,
    value: ProcurementOrderFormValue[K],
  ) => void;
  t: Translate;
}

/** Các ô nhập đầu đơn (chế độ sửa). Đơn Garage sắp theo `GARAGE_ORDER_EDIT_KEYS`. */
export function buildOrderEditFields(
  input: OrderEditFieldsInput,
): V2DrawerFieldItem[] {
  const {
    form,
    errors,
    branchLocked,
    branchOptional,
    invoicePicker,
    canPickRequest,
    requestLabel,
    requestApi,
    onPickRequest,
    setField,
    t,
  } = input;
  const requiredError = t(
    "v2.procurement.errors.required",
    "Trường này bắt buộc",
  );

  const fields: V2DrawerFieldItem[] = [
    ...(canPickRequest && requestApi && onPickRequest
      ? [
          {
            key: "requestId",
            label: t("v2.procurement.fields.request", "Từ đề nghị mua"),
            className: "sm:col-span-2",
            render: () => (
              <ProcurementRequestPicker
                value={form.requestId}
                label={requestLabel}
                requestApi={requestApi}
                onChange={onPickRequest}
              />
            ),
          },
        ]
      : []),
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
          viewing={false}
          locked={branchLocked || Boolean(form.requestId)}
          clearable={branchOptional}
          onChange={(id, name) => {
            setField("branchId", id);
            setField("branchName", name);
          }}
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
      key: "supplierId",
      label: t("v2.procurement.fields.supplier", "Nhà cung cấp"),
      className: branchOptional ? "sm:col-span-2" : undefined,
      render: () =>
        invoicePicker ? (
          <V2TextField
            viewing={false}
            value={form.supplierName}
            placeholder={t(
              "v2.procurement.fields.supplierFreeTextPlaceholder",
              "Nhập tên NCC hoặc chọn hóa đơn",
            )}
            className={V2_DRAWER_FOCUS_RING_CLASS}
            onChange={(v) => {
              // Đổi NCC thì hóa đơn thuộc NCC cũ, nên reset hóa đơn
              Object.entries(applyTypedSupplier(form, v)).forEach(([k, val]) =>
                setField(k as keyof ProcurementOrderFormValue, val as never),
              );
            }}
          />
        ) : (
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
      key: "supplierInvoiceNo",
      label: t("v2.procurement.fields.supplierInvoiceNo", "Số hóa đơn NCC"),
      className: branchOptional ? "sm:col-span-2" : undefined,
      render: () =>
        invoicePicker ? (
          <ProcurementInvoicePicker
            value={form.supplierInvoiceNo}
            viewing={false}
            onSelect={({ invoiceNo, sellerName }) => {
              const patch = applyInvoiceSelection(invoiceNo, sellerName);
              Object.entries(patch).forEach(([k, val]) =>
                setField(k as keyof ProcurementOrderFormValue, val as never),
              );
            }}
            onSupplierResolved={(supplier) => {
              if (!supplier) return;
              setField("supplierId", supplier.id);
              setField("supplierName", supplier.name);
            }}
            onClear={() => {
              Object.entries(applyInvoiceCleared()).forEach(([k, val]) =>
                setField(k as keyof ProcurementOrderFormValue, val as never),
              );
            }}
          />
        ) : (
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

  return branchOptional ? orderByKeys(fields, GARAGE_ORDER_EDIT_KEYS) : fields;
}
