import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { CashBookDto, CreateCashVoucherDto } from "./dtos/cashVoucher.dto";

const BASE = "/api/v1/bank-transactions-core";

export const cashVouchersV2Api = {
  listCashBooks: async (): Promise<CashBookDto[]> => {
    const { data } = await v2HttpClient.get<CashBookDto[]>(
      `${BASE}/cash-books`,
    );
    return data;
  },

  createManual: async (payload: CreateCashVoucherDto) => {
    const { data } = await v2HttpClient.post(
      `${BASE}/transactions/manual`,
      payload,
    );
    return data;
  },
};
