import { V2DocumentStatus } from "@/v2/shared/types";

export const GarageGoodsReceiptStatus = V2DocumentStatus;
export type GarageGoodsReceiptStatus = V2DocumentStatus;

export type GarageGoodsReceiptStatusType =
  | V2DocumentStatus
  | `${V2DocumentStatus}`;

export interface GarageGoodsReceiptLine {
  id?: string;
  lineNo?: number;
  itemCode?: string | null;
  itemName: string;
  unit?: string | null;
  qtyReceived: number;
  unitCost?: number | null;
  amount?: number | null;
  notes?: string | null;
}

export interface GarageGoodsReceipt {
  id: string;
  receiptNo: string;
  receiptDate: string;
  supplierId?: string | null;
  supplierName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  totalAmount?: number | null;
  status?: GarageGoodsReceiptStatusType | null;
  paymentStatus?: string | null;
  remarks?: string | null;
  lines?: GarageGoodsReceiptLine[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface GarageGoodsReceiptFormLine {
  id?: string;
  itemCode: string;
  itemName: string;
  unit: string;
  qtyReceived: string;
  unitCost: string;
  amount: string;
  notes: string;
}

export interface GarageGoodsReceiptFormValue {
  receiptNo: string;
  receiptDate: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  totalAmount: string;
  status: GarageGoodsReceiptStatusType;
  paymentStatus: string;
  remarks: string;
  lines: GarageGoodsReceiptFormLine[];
}

export const emptyGarageGoodsReceiptForm = (): GarageGoodsReceiptFormValue => ({
  receiptNo: "",
  receiptDate: new Date().toISOString().slice(0, 10),
  supplierId: "",
  supplierName: "",
  branchId: "",
  branchName: "",
  totalAmount: "0",
  status: GarageGoodsReceiptStatus.DRAFT,
  paymentStatus: "UNPAID",
  remarks: "",
  lines: [],
});
