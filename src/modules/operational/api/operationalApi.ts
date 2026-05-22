import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export type OperationalVariant =
  | "sales"
  | "purchase"
  | "expenses"
  | "receivables"
  | "payables"
  | "inventory";

export type OperationalDocumentType =
  | "sales_service_orders"
  | "purchase_orders"
  | "operating_expenses";

export interface OperationalDocumentPaymentLink {
  id: string;
  document_type: OperationalDocumentType;
  document_id: string;
  payment_voucher_id: string;
  applied_amount: number;
  applied_date?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface OperationalDocument {
  id: string;
  order_no?: string;
  purchase_no?: string;
  expense_no?: string;
  document_type?: OperationalDocumentType | string;
  source_system?: string;
  source_document_no?: string;
  branch_id?: string | null;
  customer_id?: string | null;
  supplier_id?: string | null;
  expense_category?: string;
  customer_name_snapshot?: string;
  supplier_name_snapshot?: string;
  title?: string;
  vehicle_plate?: string | null;
  document_date: string;
  due_date?: string | null;
  status: string;
  invoice_status: string;
  payment_status: string;
  accounting_status: string;
  inventory_status?: string;
  total_amount: number;
  settled_amount: number;
  open_amount: number;
  recurrence_type?: string;
  auto_generate_next?: boolean;
  next_due_date?: string | null;
  notes?: string | null;
  lines?: OperationalLine[];
  payments?: OperationalDocumentPaymentLink[];
}

export interface OperationalLine {
  id?: string;
  line_no?: number;
  line_type?: string;
  item_code?: string;
  item_name?: string;
  description?: string;
  inventory_item_id?: string | null;
  qty?: number;
  unit_price?: number;
  amount?: number;
  notes?: string;
}

export interface PostInventoryLinePayload {
  line_id: string;
  qty: number;
}

export interface PostInventoryDocumentPayload {
  transaction_date?: string;
  notes?: string;
  receipt_lines?: PostInventoryLinePayload[];
  issue_lines?: PostInventoryLinePayload[];
}

export interface OperationalInventoryPostResult {
  data: OperationalDocument;
}

function resolvePath(documentType: OperationalDocumentType) {
  return documentType === "sales_service_orders"
    ? "sales-service-orders"
    : documentType === "purchase_orders"
      ? "purchase-orders"
      : "operating-expenses";
}

function isRecurringDocument(row: OperationalDocument) {
  return Boolean(
    (row.recurrence_type && row.recurrence_type !== "ONE_TIME") ||
    row.auto_generate_next ||
    row.next_due_date,
  );
}

export interface InventoryStockRow {
  inventory_item_id: string;
  branch_id?: string | null;
  item_code: string;
  item_name: string;
  unit: string;
  received_qty: number;
  issued_qty: number;
  on_hand_qty: number;
  stock_value: number;
  last_transaction_date?: string | null;
}

export interface CreateOperationalPayload extends Partial<OperationalDocument> {
  lines?: OperationalLine[];
}

export interface CreateOperationalPaymentLinkPayload {
  document_type: OperationalDocumentType;
  document_id: string;
  payment_voucher_id: string;
  applied_amount: number;
  applied_date?: string;
  notes?: string;
}

function params(input: ListParams = {}) {
  return {
    page: input.page ?? 1,
    pageSize: input.pageSize ?? 20,
    sort: (input.sort ?? ["-document_date"]).join(","),
    ...(input.search ? { search: input.search } : {}),
    ...(input.branch_id ? { branch_id: input.branch_id } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.payment_status ? { payment_status: input.payment_status } : {}),
    ...(input.invoice_status ? { invoice_status: input.invoice_status } : {}),
  };
}

async function list(path: string, input?: ListParams) {
  const { data } = await axiosInstance.get<
    PaginatedResponse<OperationalDocument>
  >(`/api/v1/${path}`, { params: params(input) });
  return data;
}

export const operationalApi = {
  listSales: (input?: ListParams) => list("sales-service-orders", input),
  listPurchases: (input?: ListParams) => list("purchase-orders", input),
  listExpenses: (input?: ListParams) => list("operating-expenses", input),
  listReceivables: (input?: ListParams) =>
    list("operational-receivables", input),
  listPayables: (input?: ListParams) => list("operational-payables", input),
  listInventoryStock: async (input?: ListParams) => {
    const { data } = await axiosInstance.get<
      PaginatedResponse<InventoryStockRow>
    >("/api/v1/inventory/stock", { params: params(input) });
    return data;
  },

  createSales: async (payload: CreateOperationalPayload) => {
    const { data } = await axiosInstance.post<{ data: OperationalDocument }>(
      "/api/v1/sales-service-orders",
      payload,
    );
    return data.data;
  },
  createPurchase: async (payload: CreateOperationalPayload) => {
    const { data } = await axiosInstance.post<{ data: OperationalDocument }>(
      "/api/v1/purchase-orders",
      payload,
    );
    return data.data;
  },
  createExpense: async (payload: CreateOperationalPayload) => {
    const { data } = await axiosInstance.post<{ data: OperationalDocument }>(
      "/api/v1/operating-expenses",
      payload,
    );
    return data.data;
  },
  updateSales: async (
    id: string,
    payload: Partial<CreateOperationalPayload>,
  ) => {
    const { data } = await axiosInstance.patch<{ data: OperationalDocument }>(
      `/api/v1/sales-service-orders/${id}`,
      payload,
    );
    return data.data;
  },
  updatePurchase: async (
    id: string,
    payload: Partial<CreateOperationalPayload>,
  ) => {
    const { data } = await axiosInstance.patch<{ data: OperationalDocument }>(
      `/api/v1/purchase-orders/${id}`,
      payload,
    );
    return data.data;
  },
  updateExpense: async (
    id: string,
    payload: Partial<CreateOperationalPayload>,
  ) => {
    const { data } = await axiosInstance.patch<{ data: OperationalDocument }>(
      `/api/v1/operating-expenses/${id}`,
      payload,
    );
    return data.data;
  },
  getDocument: async (documentType: OperationalDocumentType, id: string) => {
    const { data } = await axiosInstance.get<{ data: OperationalDocument }>(
      `/api/v1/${resolvePath(documentType)}/${id}`,
    );
    return data.data;
  },
  listPaymentLinks: async (
    documentType: OperationalDocumentType,
    id: string,
  ) => {
    const { data } = await axiosInstance.get<{
      items: OperationalDocumentPaymentLink[];
    }>(`/api/v1/${documentType}/${id}/payment-links`);
    return data.items ?? [];
  },
  createPaymentLink: async (payload: CreateOperationalPaymentLinkPayload) => {
    const { data } = await axiosInstance.post<{
      message: string;
      data: OperationalDocumentPaymentLink;
    }>("/api/v1/document-payment-links", payload);
    return data.data;
  },
  deletePaymentLink: async (
    documentType: OperationalDocumentType,
    id: string,
    linkId: string,
  ) => {
    await axiosInstance.delete(
      `/api/v1/${documentType}/${id}/payment-links/${linkId}`,
    );
  },
  postPurchaseReceipt: async (
    id: string,
    payload: PostInventoryDocumentPayload,
  ) => {
    const { data } = await axiosInstance.post<OperationalInventoryPostResult>(
      `/api/v1/purchase-orders/${id}/receipt`,
      payload,
    );
    return data.data;
  },
  postSalesIssue: async (id: string, payload: PostInventoryDocumentPayload) => {
    const { data } = await axiosInstance.post<OperationalInventoryPostResult>(
      `/api/v1/sales-service-orders/${id}/issue`,
      payload,
    );
    return data.data;
  },
};

export { isRecurringDocument };
