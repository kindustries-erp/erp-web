import axiosInstance from "@/core/api/axiosInstance";
import {
  buildPaginated,
  type PaginatedResponse,
  type ListParams,
} from "@/shared/types/pagination";

export interface ErpItem {
  id: string;
  item_code: string;
  item_name: string;
  item_type: "COMPONENT" | "FINISHED_GOOD";
  tracking_type: "NONE" | "LOT" | "SERIAL";
  uom?: string | null;
  is_active: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string | null;
  on_hand_qty?: number;
  available_qty?: number;
}

export interface ErpPoLine {
  id?: string;
  inventory_item_id: string;
  ordered_qty: number;
  received_qty?: number;
  unit_price?: number;
  notes?: string;
}

export interface ErpPo {
  id: string;
  po_no: string;
  supplier_id?: string | null;
  branch_id?: string | null;
  document_date?: string;
  expected_receipt_date?: string | null;
  status:
    | "DRAFT"
    | "CONFIRMED"
    | "PARTIAL_RECEIVED"
    | "FULLY_RECEIVED"
    | "CANCELLED";
  notes?: string | null;
  lines?: ErpPoLine[];
  created_at?: string;
}

export interface ErpVehicle {
  id: string;
  vin: string;
  frame_no: string;
  engine_no: string;
  branch_id?: string | null;
  finished_good_item_id?: string | null;
  assembly_date?: string | null;
  status: "IN_ASSEMBLY" | "ASSEMBLED" | "WARRANTY_ACTIVE" | "SOLD" | "SCRAPPED";
  notes?: string | null;
  created_at?: string;
}

export interface CreateVehicleDto {
  vin?: string | null;
  frame_no: string;
  engine_no: string;
  finished_good_item_id?: string | null;
  assembly_date?: string | null;
  branch_id?: string | null;
  notes?: string | null;
  serial_no?: string | null;
}

export interface ComponentStockSummary {
  item: ErpItem & {
    stock_summary?: {
      on_hand_qty: number;
      available_qty: number;
      txn_count: number;
    };
  };
  stock: {
    on_hand_qty: number;
    available_qty: number;
    txn_count: number;
    lot_count: number;
    serial_count: number;
  };
  lots: Array<{
    id: string;
    lot_code: string;
    received_qty?: number;
    issued_qty?: number;
    on_hand_qty?: number;
    expiry_date?: string | null;
  }>;
  serials: Array<{
    id: string;
    serial_no: string;
    status?: string;
    vin_id?: string | null;
    receipt_line_id?: string | null;
  }>;
}

export interface ComponentTxn {
  id: string;
  txn_type: "RECEIPT" | "ISSUE";
  txn_date: string;
  qty: string | number;
  unit_cost?: string | number;
  amount?: string | number;
  tracking_type: "NONE" | "LOT" | "SERIAL";
  lot_code?: string | null;
  source_type: "PURCHASE_RECEIPT" | "VIN_ISSUE";
  source_id: string;
  source_no?: string | null;
  notes?: string | null;
  receipt?: {
    id: string;
    receipt_no: string;
    receipt_date?: string;
  } | null;
  purchase_order?: {
    id: string;
    po_no: string;
    document_date?: string;
    expected_receipt_date?: string | null;
    status?: string;
  } | null;
  issue?: {
    id: string;
    issue_no: string;
    issue_date?: string;
  } | null;
  vin?: {
    id: string;
    vin: string;
    frame_no: string;
    engine_no: string;
    production_order_id?: string | null;
    status?: string;
  } | null;
}

export interface MfgListParams extends ListParams {
  tracking_type?: string;
  supplier_id?: string;
  status?: string;
  branch_id?: string;
  item_type?: string;
  has_stock?: string;
  txn_type?: string;
  source_type?: string;
}

export interface CreateComponentDto {
  item_code: string;
  item_name: string;
  tracking_type: "NONE" | "LOT" | "SERIAL";
  uom?: string;
  is_active?: boolean;
  notes?: string;
}

export interface UpdateComponentDto {
  item_name?: string;
  tracking_type?: "NONE" | "LOT" | "SERIAL";
  uom?: string;
  is_active?: boolean;
  notes?: string;
}

export interface PoImportResult {
  total_rows: number;
  success_pos: number;
  failed_rows: number;
  errors: { row: number; field: string; message: string }[];
  created_pos: { po_no: string; id: string; line_count: number }[];
}

const BASE = "/api/v1/erp-manufacturing";

function p(input: MfgListParams = {}) {
  return {
    page: input.page ?? 1,
    pageSize: input.pageSize ?? 20,
    ...(input.search ? { search: input.search } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.branch_id ? { branch_id: input.branch_id } : {}),
    ...(input.supplier_id ? { supplier_id: input.supplier_id } : {}),
    ...(input.tracking_type ? { tracking_type: input.tracking_type } : {}),
    ...(input.item_type ? { item_type: input.item_type } : {}),
    ...(input.has_stock ? { has_stock: input.has_stock } : {}),
    ...(input.txn_type ? { txn_type: input.txn_type } : {}),
    ...(input.source_type ? { source_type: input.source_type } : {}),
    ...(input.sort
      ? { sort: Array.isArray(input.sort) ? input.sort[0] : input.sort }
      : {}),
  };
}

function normalizePaginated<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  return buildPaginated<T>(raw?.data ?? [], raw?.meta, page, pageSize);
}

export const manufacturingApi = {
  listItems: async (
    params?: MfgListParams,
  ): Promise<PaginatedResponse<ErpItem>> => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const { data } = await axiosInstance.get(`${BASE}/items`, {
      params: p(params),
    });
    return normalizePaginated<ErpItem>(data, page, pageSize);
  },

  listComponents: async (
    params?: MfgListParams,
  ): Promise<PaginatedResponse<ErpItem>> => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const { data } = await axiosInstance.get(`${BASE}/items/components`, {
      params: p(params),
    });
    return normalizePaginated<ErpItem>(data, page, pageSize);
  },

  createComponent: async (payload: CreateComponentDto) => {
    const { data } = await axiosInstance.post(
      `${BASE}/items/components`,
      payload,
    );
    return data;
  },

  getComponent: async (
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<ErpItem & { stock_summary?: any }> => {
    const { data } = await axiosInstance.get(`${BASE}/items/components/${id}`);
    return data;
  },

  updateComponent: async (id: string, payload: UpdateComponentDto) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/items/components/${id}`,
      payload,
    );
    return data;
  },

  getComponentStockSummary: async (
    id: string,
  ): Promise<ComponentStockSummary> => {
    const { data } = await axiosInstance.get(
      `${BASE}/items/components/${id}/stock-summary`,
    );
    return data;
  },

  listComponentTxns: async (
    id: string,
    params?: MfgListParams,
  ): Promise<PaginatedResponse<ComponentTxn>> => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const { data } = await axiosInstance.get(
      `${BASE}/items/components/${id}/txns`,
      {
        params: p(params),
      },
    );
    return normalizePaginated<ComponentTxn>(data, page, pageSize);
  },

  listPos: async (
    params?: MfgListParams,
  ): Promise<PaginatedResponse<ErpPo>> => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const { data } = await axiosInstance.get(`${BASE}/purchase-orders`, {
      params: p(params),
    });
    return normalizePaginated<ErpPo>(data, page, pageSize);
  },

  getPo: async (id: string): Promise<ErpPo> => {
    const { data } = await axiosInstance.get(`${BASE}/purchase-orders/${id}`);
    return data;
  },

  confirmPo: async (id: string) => {
    const { data } = await axiosInstance.post(
      `${BASE}/purchase-orders/${id}/confirm`,
    );
    return data;
  },

  cancelPo: async (id: string) => {
    const { data } = await axiosInstance.post(
      `${BASE}/purchase-orders/${id}/cancel`,
    );
    return data;
  },

  downloadPoTemplate: () => {
    const url = `${BASE}/purchase-orders/template/download`;
    return axiosInstance.get(url, { responseType: "blob" }).then((res) => {
      const blob = new Blob([res.data as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "erp-po-import-template.xlsx";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  },

  importPoExcel: async (file: File): Promise<PoImportResult> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await axiosInstance.post<PoImportResult>(
      `${BASE}/purchase-orders/import`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  listVehicles: async (
    params?: MfgListParams,
  ): Promise<PaginatedResponse<ErpVehicle>> => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const { data } = await axiosInstance.get(`${BASE}/vehicles`, {
      params: p(params),
    });
    return normalizePaginated<ErpVehicle>(data, page, pageSize);
  },

  getVehicle: async (id: string): Promise<ErpVehicle> => {
    const { data } = await axiosInstance.get(`${BASE}/vehicles/${id}`);
    return data;
  },

  createVehicle: async (payload: CreateVehicleDto): Promise<ErpVehicle> => {
    const { data } = await axiosInstance.post(`${BASE}/vehicles`, payload);
    return data;
  },
};
