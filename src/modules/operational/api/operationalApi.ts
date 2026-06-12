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
  item_type: string;
  unit: string;
  received_qty: number;
  issued_qty: number;
  on_hand_qty: number;
  stock_value: number;
  last_transaction_date?: string | null;
  status?: string;
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

function normalizePurchaseRow(row: any): OperationalDocument {
  const lines = Array.isArray(row?.lines)
    ? row.lines.map((line: any) => ({
        ...line,
        inventory_item_id: line.inventory_item_id ?? line.itemId ?? null,
        item_code: line.item_code ?? undefined,
        item_name: line.item_name ?? line.description ?? undefined,
        description: line.description ?? line.item_name ?? undefined,
        qty:
          line.qty !== undefined
            ? Number(line.qty)
            : Number(line.qtyOrdered ?? 0),
        unit_price:
          line.unit_price !== undefined
            ? Number(line.unit_price)
            : Number(line.unitPrice ?? 0),
        amount:
          line.amount !== undefined
            ? Number(line.amount)
            : Number(line.qtyOrdered ?? 0) * Number(line.unitPrice ?? 0),
      }))
    : [];

  const computedTotal = lines.reduce(
    (sum: number, line: OperationalLine) => sum + Number(line.amount || 0),
    0,
  );
  const totalAmount =
    row?.total_amount !== undefined && row?.total_amount !== null
      ? Number(row.total_amount)
      : row?.totalAmount !== undefined && row?.totalAmount !== null
        ? Number(row.totalAmount)
        : computedTotal;

  return {
    ...row,
    purchase_no: row.purchase_no ?? row.poNo ?? "",
    supplier_id: row.supplier_id ?? row.supplierId ?? null,
    supplier_name_snapshot:
      row.supplier_name_snapshot ??
      row.supplierName ??
      row.supplierNameSnapshot ??
      null,
    document_date: row.document_date ?? row.orderDate ?? "",
    due_date: row.due_date ?? row.expectedDate ?? null,
    status: row.status ?? "DRAFT",
    invoice_status: row.invoice_status ?? row.invoiceStatus ?? "NO_INVOICE",
    payment_status: row.payment_status ?? row.paymentStatus ?? "UNPAID",
    accounting_status:
      row.accounting_status ?? row.accountingStatus ?? "UNPOSTED",
    inventory_status:
      row.inventory_status ?? row.inventoryStatus ?? "NOT_RECEIVED",
    total_amount: totalAmount,
    settled_amount: Number(row.settled_amount ?? row.settledAmount ?? 0),
    open_amount:
      row.open_amount !== undefined && row.open_amount !== null
        ? Number(row.open_amount)
        : row.openAmount !== undefined && row.openAmount !== null
          ? Number(row.openAmount)
          : totalAmount,
    recurrence_type: row.recurrence_type ?? "ONE_TIME",
    auto_generate_next: Boolean(row.auto_generate_next),
    notes: row.notes ?? row.remarks ?? null,
    document_type: row.document_type ?? "purchase_orders",
    lines,
  } as OperationalDocument;
}

function toCorePurchasePayload(
  payload: Partial<CreateOperationalPayload>,
): Record<string, unknown> {
  return {
    poNo: payload.purchase_no || undefined,
    supplierId: payload.supplier_id || undefined,
    orderDate: payload.document_date,
    expectedDate:
      (payload as any).expected_receipt_date || payload.due_date || undefined,
    status: payload.status,
    paymentStatus: payload.payment_status,
    remarks: payload.notes || undefined,
    lines: (payload.lines || []).map((line) => ({
      itemId: line.inventory_item_id || undefined,
      description:
        line.description || line.item_name || line.item_code || undefined,
      qtyOrdered: String(line.qty ?? 0),
      unitPrice:
        line.unit_price !== undefined ? String(line.unit_price) : undefined,
      amount: line.amount !== undefined ? String(line.amount) : undefined,
    })),
  };
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
  listPurchases: async (input?: ListParams) => {
    const { data } = await axiosInstance.get<PaginatedResponse<any>>(
      "/api/v1/purchase-orders",
      {
        params: {
          page: input?.page ?? 1,
          pageSize: input?.pageSize ?? 20,
          ...(input?.search ? { search: input.search } : {}),
        },
      },
    );
    return {
      ...data,
      items: (data.items || []).map((row) => normalizePurchaseRow(row)),
    } as PaginatedResponse<OperationalDocument>;
  },
  listExpenses: (input?: ListParams) => list("operating-expenses", input),
  listReceivables: (input?: ListParams) =>
    list("operational-receivables", input),
  listPayables: (input?: ListParams) => list("operational-payables", input),
  listInventoryStock: async (input?: ListParams & { item_type?: string }) => {
    const { data } = await axiosInstance.get<
      PaginatedResponse<InventoryStockRow>
    >("/api/v1/inventory/stock", {
      params: {
        ...params(input),
        ...(input?.item_type ? { item_type: input.item_type } : {}),
      },
    });
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
    const { data } = await axiosInstance.post<{ data: any }>(
      "/api/v1/purchase-orders",
      toCorePurchasePayload(payload),
    );
    return normalizePurchaseRow(data.data);
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
    const { data } = await axiosInstance.patch<{ data: any }>(
      `/api/v1/purchase-orders/${id}`,
      toCorePurchasePayload(payload),
    );
    return normalizePurchaseRow(data.data);
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
    const { data } = await axiosInstance.get<{ data: any }>(
      `/api/v1/${resolvePath(documentType)}/${id}`,
    );
    return documentType === "purchase_orders"
      ? normalizePurchaseRow(data.data)
      : data.data;
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
