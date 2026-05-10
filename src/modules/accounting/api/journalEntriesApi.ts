import axiosInstance from "@/core/api/axiosInstance";
import type {
  AccountingPeriod,
  CreateJournalEntryPayload,
  JournalEntry,
  JournalEntryAccount,
  JournalEntryListParams,
  JournalEntryListResponse,
  ReverseJournalEntryPayload,
} from "@/modules/accounting/types/journalEntry";

export async function getJournalEntriesApi(
  params: JournalEntryListParams = {},
): Promise<JournalEntryListResponse> {
  const { data } = await axiosInstance.get<JournalEntryListResponse>(
    "/api/v1/journal-entries",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        sort: params.sort ?? "-date",
        ...(params.search ? { search: params.search } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.period_id ? { period_id: params.period_id } : {}),
        ...(params.account_id ? { account_id: params.account_id } : {}),
        ...(params.date_from ? { date_from: params.date_from } : {}),
        ...(params.date_to ? { date_to: params.date_to } : {}),
      },
    },
  );
  return data;
}

export async function getJournalEntryApi(id: string): Promise<JournalEntry> {
  const { data } = await axiosInstance.get<{ message: string; data: JournalEntry }>(
    `/api/v1/journal-entries/${id}`,
  );
  return data.data;
}

export async function createJournalEntryApi(
  payload: CreateJournalEntryPayload,
): Promise<JournalEntry> {
  const { data } = await axiosInstance.post<{ message: string; data: JournalEntry }>(
    "/api/v1/journal-entries",
    payload,
  );
  return data.data;
}

export async function postJournalEntryApi(id: string): Promise<JournalEntry> {
  const { data } = await axiosInstance.post<{ message: string; data: JournalEntry }>(
    `/api/v1/journal-entries/${id}/post`,
    {},
  );
  return data.data;
}

export async function reverseJournalEntryApi(
  id: string,
  payload: ReverseJournalEntryPayload,
): Promise<unknown> {
  const { data } = await axiosInstance.post(
    `/api/v1/journal-entries/${id}/reverse`,
    payload,
  );
  return data;
}

export async function getJournalEntryAccountsApi(
  search?: string,
): Promise<JournalEntryAccount[]> {
  const { data } = await axiosInstance.get<{ items: JournalEntryAccount[] }>(
    "/api/v1/journal-entries/lookup/accounts",
    { params: search ? { search } : undefined },
  );
  return data.items ?? [];
}

export async function getJournalEntryPeriodsApi(): Promise<AccountingPeriod[]> {
  const { data } = await axiosInstance.get<{ items: AccountingPeriod[] }>(
    "/api/v1/journal-entries/lookup/periods",
  );
  return data.items ?? [];
}
