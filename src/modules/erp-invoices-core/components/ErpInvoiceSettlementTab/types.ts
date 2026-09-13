import {
  type ErpInvoice,
  type CreateErpInvoicePayload,
} from "../../api/erpInvoicesCoreApi";

export interface ErpInvoiceSettlementTabProps {
  invoice: ErpInvoice | null;
  form?: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  direction?: "IN" | "OUT";
  onRefresh?: () => void;
}

export interface ActiveVoucherItem {
  id: string;
  bankTransactionId: string;
  refNo: string;
  description: string;
  transDate: string | null;
  amount: number;
  bankName: string;
  partnerName: string;
  isPending: boolean;
}
