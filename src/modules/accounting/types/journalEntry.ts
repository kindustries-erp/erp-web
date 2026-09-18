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

export interface JournalEntryLineItem {
  id?: string;
  accountId?: string;
  account_id?: string | JournalEntryAccount;
  account?: {
    id?: string;
    accountCode?: string;
    accountName?: string;
    account_code?: string;
    account_name?: string;
  } | null;
  debit: number | string | null;
  credit: number | string | null;
  description?: string | null;
  sort?: number | null;
}

export type JournalEntryLine = JournalEntryLineItem;

export interface JournalEntryItem {
  id: string;
  entryNo?: string;
  voucher_no?: string | null;
  date: string;
  documentDate?: string | null;
  period_id?: string | AccountingPeriod | null;
  description?: string | null;
  subjectName?: string | null;
  status: JournalEntryStatus | string;
  reference?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  sourceId?: string | null;
  sourceType?: string | null;
  branchId?: string;
  branch?: {
    id: string;
    name: string;
  } | null;
  total_debit?: number | string | null;
  total_credit?: number | string | null;
  created_by?: string | null;
  lines?: JournalEntryLineItem[];
  createdAt?: string;
  updatedAt?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export type JournalEntry = JournalEntryItem;

export interface JournalEntrySpreadsheetRow {
  _id: string;
  _entryNo: string;
  _date: string;
  _documentDate?: string | null;
  _status: string;
  _description?: string | null;
  _reference?: string | null;
  _branch?: string;
  _sourceId?: string | null;
  _sourceType?: string | null;
  _subjectName?: string | null;
  _account?: string;
  _opposingAccount?: string;
  id: string;
  debit: number;
  credit: number;
  description?: string | null;
  sort?: number | null;
  isFirstLine?: boolean;
  rowSpan?: number;
}

export interface JournalEntriesQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  sorts?: string[];
  search?: string;
  date_from?: string;
  date_to?: string;
  doc_date_from?: string;
  doc_date_to?: string;
  branch_id?: string;
  source_type?: string;
  column_filters?: string;
  column_search?: string;
  status?: JournalEntryStatus | string;
  period_id?: string;
  account_id?: string;
  [key: string]: any;
}

export type JournalEntryListParams = JournalEntriesQueryParams;

export interface JournalEntryListResponse {
  items: JournalEntryItem[];
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
