import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface WarehouseRow {
  id: string;
  voucherNo: string;
  date: string;
  type: "receipt" | "issue" | "adjustment";
  status: string | null;
  partnerId: string | null;
  partnerName: string | null;
  poNo?: string | null;
  purchaseOrderId?: string | null;
  salesOrderId?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryCode?: string | null;
  remarks: string | null;
  createdAt: string;
  totalQty?: number | string;
}

export interface WarehouseVoucherListParams extends ListParams {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  partnerId?: string;
  column_search?: string;
  column_filters?: string;
}

const BASE = "/api/v1/inventory/warehouse-vouchers";

export const warehouseVouchersCoreApi = {
  list: async (
    params?: WarehouseVoucherListParams,
  ): Promise<PaginatedResponse<WarehouseRow>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<WarehouseRow>>(
      BASE,
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.type ? { type: params.type } : {}),
          ...(params?.dateFrom ? { dateFrom: params.dateFrom } : {}),
          ...(params?.dateTo ? { dateTo: params.dateTo } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.partnerId ? { partnerId: params.partnerId } : {}),
          ...(params?.sort ? { sort: params.sort.join(",") } : {}),
          ...(params?.column_search
            ? { column_search: params.column_search }
            : {}),
          ...(params?.column_filters
            ? { column_filters: params.column_filters }
            : {}),
        },
      },
    );
    return data;
  },

  getColumnOptions: async (
    column: string,
    search: string,
    page: number = 1,
    pageSize: number = 20,
    filtersStr?: string,
    type?: string,
  ): Promise<PaginatedResponse<string>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<string>>(
      `${BASE}/column-options`,
      {
        params: {
          column,
          search,
          page,
          pageSize,
          column_filters: filtersStr,
          type,
        },
      },
    );
    return data;
  },
};
