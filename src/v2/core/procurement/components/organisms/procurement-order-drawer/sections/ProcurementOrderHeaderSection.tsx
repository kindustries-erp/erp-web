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
import { placeBranchAfter } from "../../../../procurement.branch";
import type { ProcurementApi } from "../../../../procurement.types";
import {
  ProcurementBranchPicker,
  ProcurementDateField,
  ProcurementRequestPicker,
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
  /** Chi nhánh tùy chọn (Garage): không bắt buộc, bỏ trống được, đặt ngay dưới hai ô ngày */
  branchOptional?: boolean;
  setField: <K extends keyof ProcurementOrderFormValue>(
    key: K,
    value: ProcurementOrderFormValue[K],
  ) => void;
  /** Hiện ô chọn đề nghị mua (chỉ khi tạo mới và có quyền đọc đề nghị) */
  canPickRequest?: boolean;
  /** Tên đề nghị đã chọn, để hiện ở ô và chế độ xem */
  requestLabel?: string;
  requestApi?: ProcurementApi<unknown>;
  onPickRequest?: (requestId: string | null) => void;
}

/**
 * Section đầu đơn mua (cột phải). Sửa: lưới 2 cột, Ngày đơn và Ngày dự kiến nhận cùng hàng,
 * chi nhánh (Garage đặt dưới hai ô ngày). Chi nhánh khóa khi đơn gắn đề nghị.
 */
export function ProcurementOrderHeaderSection({
  form,
  errors,
  viewing,
  branchLocked,
  branchOptional = false,
  setField,
  canPickRequest = false,
  requestLabel = "",
  requestApi,
  onPickRequest,
}: ProcurementOrderHeaderSectionProps) {
  const { t } = useV2Translation();
  const requiredError = t(
    "v2.procurement.errors.required",
    "Trường này bắt buộc",
  );

  if (viewing) {
    const rows: DrawerRowConfig[] = placeBranchAfter(
      [
        ...(form.requestId
          ? [
              {
                key: "request",
                label: t("v2.procurement.fields.request", "Từ đề nghị mua"),
                value: requestLabel || form.requestId,
              },
            ]
          : []),
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
          key: "expectedDate",
          label: t("v2.procurement.fields.expectedDate", "Ngày dự kiến nhận"),
          value: form.expectedDate || "—",
        },
        {
          key: "supplier",
          label: t("v2.procurement.fields.supplier", "Nhà cung cấp"),
          value: form.supplierName || "—",
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
      ],
      ["branch"],
      "expectedDate",
      branchOptional,
    );

    return (
      <DrawerSection
        title={t("v2.procurement.sections.header", "Thông tin đơn")}
      >
        <V2DrawerRowList rows={rows} />
      </DrawerSection>
    );
  }

  const fields: V2DrawerFieldItem[] = placeBranchAfter(
    [
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
    ],
    ["branchId"],
    "expectedDate",
    branchOptional,
  );

  return (
    <DrawerSection title={t("v2.procurement.sections.header", "Thông tin đơn")}>
      <V2DrawerFieldGrid fields={fields} />
    </DrawerSection>
  );
}
