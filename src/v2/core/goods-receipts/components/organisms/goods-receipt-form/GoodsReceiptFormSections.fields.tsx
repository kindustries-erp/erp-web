import type { ReactNode } from "react";
import { RotateCw } from "lucide-react";
import {
  V2Button,
  V2Textarea,
  V2ReadValue,
  V2TextField,
} from "@/v2/shared/components";
import type { GoodsReceiptFormValue } from "@/v2/core/goods-receipts";
import { ProcurementBranchPicker } from "@/v2/core/procurement";
import { GoodsReceiptOrderPicker } from "../../molecules/goods-receipt-order-picker/GoodsReceiptOrderPicker";
import { cn } from "@/v2/shared/utils/cn";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import type { FormSectionsProps } from "./GoodsReceiptFormSections.type";

type FieldRenderer = (props: FormSectionsProps) => ReactNode;

const renderReceiptNo: FieldRenderer = ({
  form,
  viewing,
  codeEditable,
  onRegenerateCode,
  t,
  setField,
}) => (
  <div className="flex gap-2">
    <div className="min-w-0 flex-1">
      <V2TextField
        viewing={viewing}
        value={form.receiptNo}
        className={cn("font-mono", V2_DRAWER_FOCUS_RING_CLASS)}
        disabled={!codeEditable}
        onChange={(v) => setField("receiptNo", v.toUpperCase())}
      />
    </div>
    {!viewing && codeEditable && (
      <V2Button
        variant="outline"
        size="icon-sm"
        aria-label={t("v2.goodsReceipts.form.generateCode", "Sinh mã")}
        onClick={onRegenerateCode}
      >
        <RotateCw className="h-4 w-4" />
      </V2Button>
    )}
  </div>
);

const renderReceiptDate: FieldRenderer = ({ form, viewing, setField }) => (
  <V2TextField
    viewing={viewing}
    value={form.receiptDate}
    className={V2_DRAWER_FOCUS_RING_CLASS}
    onChange={(v) => setField("receiptDate", v)}
  />
);

/** Đơn mua nguồn: chọn một đơn đã phát hành; NCC, chi nhánh, dòng hàng lấy theo đơn đó. */
const renderSourceOrderId: FieldRenderer = ({
  form,
  viewing,
  sourceOrder,
  orderLocked,
  onPickOrder,
}) =>
  sourceOrder ? (
    <GoodsReceiptOrderPicker
      sourceOrder={sourceOrder}
      value={form.sourceOrderId}
      label={form.sourceOrderNo}
      viewing={viewing}
      locked={Boolean(orderLocked)}
      onPick={(id) => onPickOrder?.(id)}
    />
  ) : null;

const renderSourceOrderTotal: FieldRenderer = ({ form }) => (
  <V2ReadValue
    value={
      form.sourceOrderTotal
        ? `${Number(form.sourceOrderTotal).toLocaleString("vi-VN")} ₫`
        : "—"
    }
  />
);

/** Phiếu gắn đơn mua: NCC lấy theo đơn (chỉ đọc); phiếu không gắn đơn nhập tay như cũ. */
const renderSupplierName: FieldRenderer = ({
  form,
  viewing,
  sourceOrder,
  t,
  setField,
}) =>
  sourceOrder ? (
    <V2ReadValue
      value={
        form.supplierName ||
        t("v2.goodsReceipts.form.supplierFromOrder", "Tự điền theo đơn mua")
      }
    />
  ) : (
    <V2TextField
      viewing={viewing}
      value={form.supplierName}
      className={V2_DRAWER_FOCUS_RING_CLASS}
      onChange={(v) => setField("supplierName", v)}
    />
  );

/** Phiếu nhập chọn tối đa một chi nhánh; để trống thì tồn kho vào nhóm không chi nhánh. */
const renderBranchName: FieldRenderer = ({
  form,
  viewing,
  sourceOrder,
  setField,
}) =>
  sourceOrder ? (
    <V2ReadValue value={form.branchName || "—"} />
  ) : (
    <ProcurementBranchPicker
      value={form.branchId}
      label={form.branchName}
      viewing={viewing}
      clearable
      onChange={(id, name) => {
        setField("branchId", id);
        setField("branchName", name);
      }}
    />
  );

const renderTotalAmount: FieldRenderer = ({ form, viewing, setField }) => (
  <V2TextField
    viewing={viewing}
    value={Number(form.totalAmount || 0).toLocaleString("vi-VN")}
    disabled
    inputMode="decimal"
    className={V2_DRAWER_FOCUS_RING_CLASS}
    onChange={(v) => setField("totalAmount", v)}
  />
);

const renderRemarks: FieldRenderer = ({ form, viewing, setField }) =>
  viewing ? (
    <V2ReadValue value={form.remarks} />
  ) : (
    <V2Textarea
      className={cn("min-h-20", V2_DRAWER_FOCUS_RING_CLASS)}
      value={form.remarks}
      onChange={(e) => setField("remarks", e.target.value)}
    />
  );

/** Render từng trường form theo khóa; khóa không có trong bảng sẽ không được hiển thị */
export const GOODS_RECEIPT_FIELD_RENDERERS: Partial<
  Record<keyof GoodsReceiptFormValue, FieldRenderer>
> = {
  receiptNo: renderReceiptNo,
  receiptDate: renderReceiptDate,
  supplierName: renderSupplierName,
  branchName: renderBranchName,
  totalAmount: renderTotalAmount,
  sourceOrderId: renderSourceOrderId,
  sourceOrderTotal: renderSourceOrderTotal,
  remarks: renderRemarks,
};
