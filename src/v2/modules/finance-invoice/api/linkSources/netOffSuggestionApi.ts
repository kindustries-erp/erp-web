import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { NetOffSuggestionDto } from "./linkSourceDto";

const SUGGESTIONS_URL = "/api/v1/erp-invoices/smart-net-off-suggestions";

/** Gợi ý cấn trừ (sao kê và sổ quỹ) cho một hóa đơn; chỉ đọc */
export const netOffSuggestionApi = {
  list: async (invoiceId: string): Promise<NetOffSuggestionDto[]> => {
    const { data } = await v2HttpClient.post<
      Record<string, NetOffSuggestionDto[]>
    >(SUGGESTIONS_URL, {
      invoiceIds: [invoiceId],
    });
    return data[invoiceId] ?? [];
  },
};
