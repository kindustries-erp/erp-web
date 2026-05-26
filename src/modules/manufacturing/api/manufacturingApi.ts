import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface MfgListParams extends ListParams {
  tracking_type?: string;
  supplier_id?: string;
}

export interface PoImportResult {
  total_rows: number;
  success_pos: number;
  failed_rows: number;
  errors: { row: number; field: string; message: string }[];
  created_pos: { po_no: string; id: string; line_count: number }[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

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
  };
}

export const manufacturingApi = {
  // ── Items ──────────────────────────────────────────────────────────────────
  listItems: async (
    params?: MfgListParams,
  ): Promise<PaginatedResponse<ErpItem>> => {
    const { data } = await axiosInstance.get(`${BASE}/items`, {
      params: p(params),
    });
    return data;
  },

  // ── PO ────────────────────────────────────────────────────────────────────
  listPos: async (
    params?: MfgListParams,
  ): Promise<PaginatedResponse<ErpPo>> => {
    const { data } = await axiosInstance.get(`${BASE}/purchase-orders`, {
      params: p(params),
    });
    return data;
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

  // ── Template & Import ─────────────────────────────────────────────────────
  downloadPoTemplate: () => {
    const url = `${BASE}/purchase-orders/template/download`;
    // Need auth token — build it with axios interceptor
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

  // ── Vehicles ──────────────────────────────────────────────────────────────
  listVehicles: async (
    params?: MfgListParams,
  ): Promise<PaginatedResponse<ErpVehicle>> => {
    const { data } = await axiosInstance.get(`${BASE}/vehicles`, {
      params: p(params),
    });
    return data;
  },
};
