import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";

const BASE = "/api/v1/accounting-core";

export interface ChartOfAccountDto {
  id: string;
  accountCode: string;
  accountName: string;
}

export interface JournalEntryLineDto {
  id?: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string | null;
}

/** Bút toán đã ghi sổ; trường số bút toán có thể là voucherNo hoặc entryNo tùy bản API */
export interface JournalEntryDto {
  id: string;
  entryDate?: string | null;
  voucherNo?: string | null;
  entryNo?: string | null;
  description?: string | null;
  lines: JournalEntryLineDto[];
}

export const accountingLookupApi = {
  /** API trả về mảng hoặc `{ items }` tùy phiên bản; chuẩn hóa về mảng */
  listChartOfAccounts: async (): Promise<ChartOfAccountDto[]> => {
    const { data } = await v2HttpClient.get<
      ChartOfAccountDto[] | { items: ChartOfAccountDto[] }
    >(`${BASE}/chart-of-accounts`);
    return Array.isArray(data) ? data : (data.items ?? []);
  },

  getJournalEntry: async (id: string): Promise<JournalEntryDto> => {
    const { data } = await v2HttpClient.get<JournalEntryDto>(
      `${BASE}/journal-entries/${id}`,
    );
    return data;
  },
};
