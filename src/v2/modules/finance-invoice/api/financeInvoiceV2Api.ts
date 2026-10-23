import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { InvoiceListQueryParams } from "./adapters/invoiceQueryAdapter";
import type {
  InvoiceColumnOptionsResponseDto,
  InvoiceDto,
  InvoiceDashboardPartnersDto,
  InvoiceDashboardStatsDto,
  InvoiceListResponseDto,
  InvoiceStatsDto,
} from "./dtos/invoice.dto";

const BASE_URL = "/api/v1/erp-invoices";
const DASHBOARD_URL = `${BASE_URL}/dashboard`;

export interface InvoiceColumnOptionsParams {
  column: string;
  search: string;
  page: number;
  pageSize: number;
  columnFilters?: string;
  direction?: "IN" | "OUT";
}

/** Client API của module hóa đơn trên V2; không import code V1 */
export const financeInvoiceV2Api = {
  list: async (
    params: InvoiceListQueryParams,
  ): Promise<InvoiceListResponseDto> => {
    const { data } = await v2HttpClient.get<InvoiceListResponseDto>(BASE_URL, {
      params,
    });
    return data;
  },

  getColumnOptions: async (
    params: InvoiceColumnOptionsParams,
  ): Promise<InvoiceColumnOptionsResponseDto> => {
    const { data } = await v2HttpClient.get<InvoiceColumnOptionsResponseDto>(
      `${BASE_URL}/column-options`,
      {
        params: {
          column: params.column,
          search: params.search,
          page: params.page,
          pageSize: params.pageSize,
          column_filters: params.columnFilters,
          direction: params.direction,
        },
      },
    );
    return data;
  },

  /** Chi tiết một hóa đơn; API bọc kết quả trong `data` */
  get: async (id: string): Promise<InvoiceDto> => {
    const { data } = await v2HttpClient.get<{ data: InvoiceDto }>(
      `${BASE_URL}/${id}`,
    );
    return data.data;
  },

  /** KPI tháng hiện tại của một chiều (IN = mua vào, OUT = bán ra) */
  getStats: async (direction: "IN" | "OUT"): Promise<InvoiceStatsDto> => {
    const { data } = await v2HttpClient.get<InvoiceStatsDto>(
      `${BASE_URL}/stats`,
      { params: { direction } },
    );
    return data;
  },

  /** Xu hướng dòng tiền và VAT theo tháng */
  getDashboardStats: async (): Promise<InvoiceDashboardStatsDto> => {
    const { data } = await v2HttpClient.get<InvoiceDashboardStatsDto>(
      `${DASHBOARD_URL}/stats`,
    );
    return data;
  },

  /** Đối tác và công nợ; trang đầu để vẽ cơ cấu đối tác */
  getDashboardPartners: async (
    pageSize: number,
  ): Promise<InvoiceDashboardPartnersDto> => {
    const { data } = await v2HttpClient.get<InvoiceDashboardPartnersDto>(
      `${DASHBOARD_URL}/partners`,
      { params: { page: 1, pageSize } },
    );
    return data;
  },
};
