import type { ReactNode } from "react";
import { RotateCw } from "lucide-react";
import {
  V2Button,
  V2ReadValue,
  V2TextField,
  V2Textarea,
} from "@/v2/shared/components";
import { cn } from "@/v2/shared/utils/cn";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import type { PurchaseOrderFormField } from "../../../domain/purchaseOrder";
import type { PurchaseOrderFormSectionsProps } from "./PurchaseOrderFormSections.type";

type FieldRenderer = (props: PurchaseOrderFormSectionsProps) => ReactNode;

const renderPoNo: FieldRenderer = ({
  form,
  viewing,
  creating,
  onRegenerateNo,
  t,
  setField,
}) => (
  <div className="flex gap-2">
    <div className="min-w-0 flex-1">
      <V2TextField
        viewing={viewing}
        value={form.poNo}
        className={cn("font-mono", V2_DRAWER_FOCUS_RING_CLASS)}
        disabled={!creating}
        onChange={(v) => setField("poNo", v.toUpperCase())}
      />
    </div>
    {!viewing && creating && (
      <V2Button
        variant="outline"
        size="icon-sm"
        aria-label={t("v2.purchaseOrders.form.generateNo", "Sinh số mới")}
        onClick={onRegenerateNo}
      >
        <RotateCw className="h-4 w-4" />
      </V2Button>
    )}
  </div>
);

const textField =
  (
    key:
      | "orderDate"
      | "expectedDate"
      | "supplierName"
      | "branchName"
      | "supplierInvoiceNo",
  ): FieldRenderer =>
  ({ form, viewing, setField }) => (
    <V2TextField
      viewing={viewing}
      value={form[key]}
      className={V2_DRAWER_FOCUS_RING_CLASS}
      onChange={(v) => setField(key, v)}
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
export const PURCHASE_ORDER_FIELD_RENDERERS: Partial<
  Record<PurchaseOrderFormField, FieldRenderer>
> = {
  poNo: renderPoNo,
  orderDate: textField("orderDate"),
  expectedDate: textField("expectedDate"),
  supplierName: textField("supplierName"),
  branchName: textField("branchName"),
  supplierInvoiceNo: textField("supplierInvoiceNo"),
  remarks: renderRemarks,
};
