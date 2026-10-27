import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  BankTransactionLinkDto,
  LinkPageDto,
  LinkPageQuery,
} from "./linkSourceDto";

const BANK_TRANSACTIONS_URL = "/api/v1/bank-transactions-core/transactions";

/** Danh sách giao dịch sao kê cho modal cấn trừ hóa đơn; chỉ đọc, mới nhất trước */
export const bankTransactionLinkApi = {
  list: async (
    query: LinkPageQuery,
  ): Promise<LinkPageDto<BankTransactionLinkDto>> => {
    const { data } = await v2HttpClient.get<
      LinkPageDto<BankTransactionLinkDto>
    >(BANK_TRANSACTIONS_URL, {
      params: {
        page: query.page,
        pageSize: query.pageSize,
        sortBy: "transDate",
        sortOrder: "DESC",
        sourceType: "BANK",
        ...(query.search ? { search: query.search } : {}),
      },
    });
    return data;
  },
};
