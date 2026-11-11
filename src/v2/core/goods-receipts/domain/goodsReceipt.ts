import { V2DocumentStatus } from "@/v2/shared/types";
import { GOODS_RECEIPT_DEFAULT_UNIT } from "./goodsReceiptConstants";
import type { GoodsReceiptFormLine } from "./goodsReceiptLine";

export const GoodsReceiptStatus = V2DocumentStatus;
export type GoodsReceiptStatus = V2DocumentStatus;
export type GoodsReceiptStatusType = V2DocumentStatus | `${V2DocumentStatus}`;

/** Dòng phiếu như API trả về */
export interface GoodsReceiptRecordLine {
  id?: string;
  lineNo?: number;
  itemCode?: string | null;
  itemName: string;
  unit?: string | null;
  qtyReceived: number;
  unitCost?: number | null;
  amount?: number | null;
  notes?: string | null;
  sourceLineId?: string | null;
}

/** Phiếu nhập như API trả về; mỗi họ phiếu dùng chung kiểu này */
export interface GoodsReceiptRecord {
  id: string;
  receiptNo: string;
  receiptDate: string;
  supplierId?: string | null;
  supplierName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  totalAmount?: number | null;
  status?: string | null;
  paymentStatus?: string | null;
  remarks?: string | null;
  /** Id đơn mua nguồn (nếu phiếu nhập từ đơn mua) */
  sourceOrderId?: string | null;
  /** Số đơn mua nguồn (chỉ đọc) */
  sourceOrderNo?: string | null;
  /** Tổng tiền đơn mua nguồn (chỉ đọc) */
  sourceOrderTotal?: number | null;
  lines?: GoodsReceiptRecordLine[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** Giá trị form của phiếu nhập (chuỗi, phục vụ input) */
export interface GoodsReceiptFormValue {
  receiptNo: string;
  receiptDate: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  totalAmount: string;
  status: GoodsReceiptStatusType;
  paymentStatus: string;
  remarks: string;
  /** Id đơn mua nguồn; rỗng nếu không nhập từ đơn mua */
  sourceOrderId: string;
  /** Số và tổng tiền đơn mua nguồn: chỉ để hiển thị, không gửi API */
  sourceOrderNo: string;
  sourceOrderTotal: string;
  lines: GoodsReceiptFormLine[];
}

/** Khóa của form dùng để báo lỗi bắt buộc theo trường */
export type GoodsReceiptFormField = keyof GoodsReceiptFormValue;

export const emptyGoodsReceiptForm = (): GoodsReceiptFormValue => ({
  receiptNo: "",
  receiptDate: new Date().toISOString().slice(0, 10),
  supplierId: "",
  supplierName: "",
  branchId: "",
  branchName: "",
  totalAmount: "0",
  status: GoodsReceiptStatus.DRAFT,
  paymentStatus: "UNPAID",
  remarks: "",
  sourceOrderId: "",
  sourceOrderNo: "",
  sourceOrderTotal: "",
  lines: [],
});

/** Đưa dữ liệu điền sẵn từ đơn mua vào form phiếu mới; tổng tiền tính theo các dòng */
export const applyGoodsReceiptPrefill = (
  form: GoodsReceiptFormValue,
  prefill: {
    sourceOrderId: string;
    sourceOrderNo?: string;
    sourceOrderTotal?: number;
    supplierId: string;
    supplierName: string;
    branchId: string;
    branchName: string;
    lines: GoodsReceiptFormLine[];
  },
): GoodsReceiptFormValue => ({
  ...form,
  sourceOrderId: prefill.sourceOrderId,
  sourceOrderNo: prefill.sourceOrderNo ?? "",
  sourceOrderTotal:
    prefill.sourceOrderTotal == null ? "" : String(prefill.sourceOrderTotal),
  supplierId: prefill.supplierId,
  supplierName: prefill.supplierName,
  branchId: prefill.branchId,
  branchName: prefill.branchName,
  lines: prefill.lines,
  totalAmount: String(
    prefill.lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0),
  ),
});

/** Chuyển phiếu từ API sang giá trị form; dòng thiếu đơn vị dùng đơn vị mặc định */
export const toGoodsReceiptForm = (
  data: GoodsReceiptRecord,
): GoodsReceiptFormValue => ({
  receiptNo: data.receiptNo ?? "",
  receiptDate: data.receiptDate ? data.receiptDate.slice(0, 10) : "",
  supplierId: data.supplierId ?? "",
  supplierName: data.supplierName ?? "",
  branchId: data.branchId ?? "",
  branchName: data.branchName ?? "",
  totalAmount: data.totalAmount == null ? "" : String(data.totalAmount),
  status: (data.status as GoodsReceiptStatusType) || GoodsReceiptStatus.DRAFT,
  paymentStatus: data.paymentStatus || "UNPAID",
  remarks: data.remarks ?? "",
  sourceOrderId: data.sourceOrderId ?? "",
  sourceOrderNo: data.sourceOrderNo ?? "",
  sourceOrderTotal:
    data.sourceOrderTotal == null ? "" : String(data.sourceOrderTotal),
  lines:
    data.lines?.map((l) => ({
      id: l.id,
      itemCode: l.itemCode ?? "",
      itemName: l.itemName ?? "",
      unit: l.unit ?? GOODS_RECEIPT_DEFAULT_UNIT,
      qtyReceived: String(l.qtyReceived ?? 0),
      unitCost: String(l.unitCost ?? 0),
      amount: String(l.amount ?? 0),
      notes: l.notes ?? "",
      sourceLineId: l.sourceLineId ?? "",
    })) || [],
});

/** Bỏ đơn mua đã chọn: xóa NCC, chi nhánh, tổng và dòng lấy từ đơn đó */
export const clearGoodsReceiptSourceOrder = (
  form: GoodsReceiptFormValue,
): GoodsReceiptFormValue => ({
  ...form,
  sourceOrderId: "",
  sourceOrderNo: "",
  sourceOrderTotal: "",
  supplierId: "",
  supplierName: "",
  branchId: "",
  branchName: "",
  totalAmount: "0",
  lines: [],
});
