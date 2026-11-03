import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  BankTransactionLinkDto,
  LinkPageDto,
  LinkPageQuery,
} from "./linkSourceDto";

const BANK_TRANSACTIONS_URL = "/api/v1/bank-transactions-core/transactions";

/** Nguồn dòng tiền: sao kê ngân hàng hoặc sổ quỹ tiền mặt */
export type BankLinkSource = "BANK" | "CASH";

/** Danh sách giao dịch sao kê hoặc sổ quỹ cho modal cấn trừ; chỉ đọc, mới nhất trước */
export const bankTransactionLinkApi = {
  list: async (
    query: LinkPageQuery,
    source: BankLinkSource = "BANK",
  ): Promise<LinkPageDto<BankTransactionLinkDto>> => {
    const { data } = await v2HttpClient.get<
      LinkPageDto<BankTransactionLinkDto>
    >(BANK_TRANSACTIONS_URL, {
      params: {
        page: query.page,
        pageSize: query.pageSize,
        sortBy: "transDate",
        sortOrder: "DESC",
        sourceType: source,
        ...(query.search ? { search: query.search } : {}),
      },
    });
    return data;
  },
};
