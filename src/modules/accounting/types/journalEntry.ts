export type JournalEntryStatus = "posted" | "reversed";

export interface JournalEntryAccount {
  id: string;
  account_code?: string | null;
  account_name?: string | null;
  account_type?: string | null;
}

export interface AccountingPeriod {
  id: string;
  name: string;
  status: "open" | "closed" | string;
  start_date?: string | null;
  end_date?: string | null;
}

export interface JournalEntryLine {
  id?: string;
  account_id: string | JournalEntryAccount;
  debit: number | string | null;
  credit: number | string | null;
  description?: string | null;
  sort?: number | null;
}

export interface JournalEntry {
  id: string;
  voucher_no?: string | null;
  date: string;
  period_id?: string | AccountingPeriod | null;
  description?: string | null;
  status: JournalEntryStatus;
  reference_type?: string | null;
  reference_id?: string | null;
  total_debit: number | string | null;
  total_credit: number | string | null;
  branch_id?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  lines?: JournalEntryLine[];
}

export interface JournalEntryListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  status?: JournalEntryStatus | "";
  period_id?: string;
  account_id?: string;
  date_from?: string;
  date_to?: string;
  branch_id?: string;
}

export interface JournalEntryListResponse {
  items: JournalEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface JournalEntryFormLine {
  account_id: string;
  debit: string;
  credit: string;
  description: string;
}

/** Simplified form line: debit account + credit account + amount (single row = 2 lines) */
export interface SimpleJournalEntryFormLine {
  debit_account_id: string;
  credit_account_id: string;
  amount: string;
  description: string;
}

export interface CreateJournalEntryPayload {
  voucher_no?: string;
  date: string;
  period_id?: string | null;
  description?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  branch_id?: string | null;
  lines: Array<{
    account_id: string;
    debit: number;
    credit: number;
    description?: string;
    sort?: number;
  }>;
}

export const JOURNAL_ENTRY_STATUS_OPTIONS: Array<{
  value: JournalEntryStatus | "";
  labelKey: string;
}> = [
  { value: "", labelKey: "journalEntries.status.all" },
  { value: "posted", labelKey: "journalEntries.status.posted" },
  { value: "reversed", labelKey: "journalEntries.status.reversed" },
];
