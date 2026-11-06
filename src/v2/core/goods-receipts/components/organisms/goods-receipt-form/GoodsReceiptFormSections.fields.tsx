import type { ReactNode } from "react";
import { RotateCw } from "lucide-react";
import {
  V2Button,
  V2Textarea,
  V2ReadValue,
  V2TextField,
} from "@/v2/shared/components";
import {
  GoodsReceiptStatus,
  type GoodsReceiptFormValue,
} from "@/v2/core/goods-receipts";
import { GoodsReceiptStatusBadge } from "../../molecules/goods-receipt-status-badge/GoodsReceiptStatusBadge";
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

const renderSupplierName: FieldRenderer = ({ form, viewing, setField }) => (
  <V2TextField
    viewing={viewing}
    value={form.supplierName}
    className={V2_DRAWER_FOCUS_RING_CLASS}
    onChange={(v) => setField("supplierName", v)}
  />
);

const renderBranchName: FieldRenderer = ({ form, viewing, setField }) => (
  <V2TextField
    viewing={viewing}
    value={form.branchName}
    className={V2_DRAWER_FOCUS_RING_CLASS}
    onChange={(v) => setField("branchName", v)}
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

const renderStatus: FieldRenderer = ({ form }) => (
  <div className="flex items-center min-h-[36px]">
    <GoodsReceiptStatusBadge status={form.status} />
  </div>
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
  status: renderStatus,
  remarks: renderRemarks,
};
