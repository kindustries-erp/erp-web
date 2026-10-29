import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  LinkPageDto,
  PurchaseOrderLinkDto,
  LinkPageQuery,
} from "./linkSourceDto";

const PURCHASE_ORDERS_URL = "/api/v1/purchase-orders";

/** Danh sách đơn mua hàng cho modal ghép nối hóa đơn; chỉ đọc */
export const purchaseOrderLinkApi = {
  list: async (
    query: LinkPageQuery,
  ): Promise<LinkPageDto<PurchaseOrderLinkDto>> => {
    const { data } = await v2HttpClient.get<LinkPageDto<PurchaseOrderLinkDto>>(
      PURCHASE_ORDERS_URL,
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
