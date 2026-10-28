import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  LinkPageDto,
  LinkPageQuery,
  SalesOrderLinkDto,
} from "./linkSourceDto";

const SALES_ORDERS_URL = "/api/v1/sales-orders";

/** Danh sách đơn bán hàng cho modal ghép nối hóa đơn bán ra; chỉ đọc */
export const salesOrderLinkApi = {
  list: async (
    query: LinkPageQuery,
  ): Promise<LinkPageDto<SalesOrderLinkDto>> => {
    const { data } = await v2HttpClient.get<LinkPageDto<SalesOrderLinkDto>>(
      SALES_ORDERS_URL,
      {
        params: {
          page: query.page,
          pageSize: query.pageSize,
          ...(query.search ? { search: query.search } : {}),
        },
      },
    );
    return data;
  },
};
