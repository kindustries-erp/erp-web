import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface WarehouseRow {
  id: string;
  voucherNo: string;
  date: string;
  type: "receipt" | "issue";
  status: string | null;
  partnerId: string | null;
  partnerName: string | null;
  poNo?: string | null;
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
        },
      },
    );
    return data;
  },
};
