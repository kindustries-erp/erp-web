import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  ColumnOptionsResponseDto,
  PartnerDashboardStatsDto,
} from "./dtos/partnerStats.dto";

const BASE = "/api/v1/bank-transactions-core";

/** Bỏ tham số rỗng để không gửi `undefined` hay chuỗi trống lên query */
const withoutEmpty = <T extends object>(params: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  ) as Partial<T>;

export interface PartnerKeyParams {
  correspondentAccount?: string;
  correspondentName?: string;
}

export interface PartnerColumnOptionsParams extends PartnerKeyParams {
  column: string;
  search: string;
  page: number;
  pageSize: number;
  /** JSON của bộ lọc cột hiện tại; khóa đối tác được gắn thêm trước khi gửi */
  columnFilters?: string;
  sourceType?: "BANK" | "CASH";
}

export const partnerStatsApi = {
  getDashboardStats: async (
    params: PartnerKeyParams,
  ): Promise<PartnerDashboardStatsDto> => {
    const { data } = await v2HttpClient.get<PartnerDashboardStatsDto>(
      `${BASE}/dashboard-stats`,
      { params: withoutEmpty(params) },
    );
    return data;
  },

  getColumnOptions: async ({
    columnFilters,
    ...rest
  }: PartnerColumnOptionsParams): Promise<ColumnOptionsResponseDto> => {
    const { data } = await v2HttpClient.get<ColumnOptionsResponseDto>(
      `${BASE}/transactions/column-options`,
      {
        params: withoutEmpty({
          ...rest,
          column_filters: columnFilters,
        }),
      },
    );
    return data;
  },
};
