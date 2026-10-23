import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { InvoiceListQueryParams } from "./adapters/invoiceQueryAdapter";
import type {
  InvoiceColumnOptionsResponseDto,
  InvoiceListResponseDto,
} from "./dtos/invoice.dto";

const BASE_URL = "/api/v1/erp-invoices";

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
};
