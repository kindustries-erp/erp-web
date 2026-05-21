import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface OperationalDocument {
  id: string;
  order_no?: string;
  purchase_no?: string;
  expense_no?: string;
  document_type?: string;
  source_system?: string;
  source_document_no?: string;
  branch_id?: string | null;
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
  total_amount: number;
  settled_amount: number;
  open_amount: number;
  recurrence_type?: string;
  auto_generate_next?: boolean;
  next_due_date?: string | null;
  notes?: string | null;
}

export interface OperationalLine {
  line_no?: number;
  line_type?: string;
  item_code?: string;
  item_name?: string;
  description?: string;
  qty?: number;
  unit_price?: number;
  amount?: number;
  notes?: string;
}

export interface CreateOperationalPayload extends Partial<OperationalDocument> {
  lines?: OperationalLine[];
}

function params(input: ListParams = {}) {
  return {
    page: input.page ?? 1,
    pageSize: input.pageSize ?? 50,
    sort: (input.sort ?? ["-document_date"]).join(","),
    ...(input.search ? { search: input.search } : {}),
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
};
