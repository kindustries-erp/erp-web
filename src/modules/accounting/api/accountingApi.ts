import axiosInstance from "@/core/api/axiosInstance";

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BaseQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
}

export interface AccountOption {
  id: string;
  account_code: string;
  account_name: string;
}

export interface PeriodOption {
  id: string;
  period_code: string;
}

export type JournalEntryPayload = {
  date?: string;
  description?: string;
  lines?: Array<{
    id?: string;
    account_id: string;
    debit?: number;
    credit?: number;
    description?: string;
    sort?: number;
  }>;
};

export type AccountingConfigPayload = {
  module?: string;
  debit_account_id?: string | null;
  credit_account_id?: string | null;
  description?: string;
  is_active?: boolean;
};

export interface ErpJournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit: number;
  credit: number;
  description: string;
  sort: number;
  account?: {
    id: string;
    account_code: string;
    account_name: string;
  };
}

export interface ErpJournalEntryAttachment {
  id: string;
  file_name: string;
  r2_file_key: string;
  content_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface ErpJournalEntry {
  id: string;
  voucher_no: string;
  date: string;
  description: string;
  status: string;
  reference_type: string;
  reference_id: string;
  total_debit: number;
  total_credit: number;
  created_at: string;
  lines?: ErpJournalEntryLine[];
  attachments?: ErpJournalEntryAttachment[];
  period?: {
    id: string;
    period_code: string;
  };
}

export interface JournalEntryQuery extends BaseQuery {
  status?: string;
  period_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  account_id?: string;
}

export interface ErpAccountingConfig {
  id: string;
  module: string;
  debit_account_id: string | null;
  credit_account_id: string | null;
  is_active: boolean;
  description: string;
  debit_account?: {
    id: string;
    account_code: string;
    account_name: string;
  };
  credit_account?: {
    id: string;
    account_code: string;
    account_name: string;
  };
}

const BASE_J = "/api/v1/journal-entries";
const BASE_C = "/api/v1/accounting-configs";

export const accountingApi = {
  // --- Journal Entries ---
  getJournalEntries: async (params: JournalEntryQuery) => {
    const res = await axiosInstance.get<PagedResponse<ErpJournalEntry>>(
      BASE_J,
      { params },
    );
    return res.data;
  },

  getJournalEntry: async (id: string) => {
    const res = await axiosInstance.get<{ data: ErpJournalEntry }>(
      `${BASE_J}/${id}`,
    );
    return res.data.data;
  },

  createJournalEntry: async (payload: JournalEntryPayload) => {
    const res = await axiosInstance.post<{ data: ErpJournalEntry }>(
      BASE_J,
      payload,
    );
    return res.data.data;
  },

  updateJournalEntry: async (id: string, payload: JournalEntryPayload) => {
    const res = await axiosInstance.patch<{ data: ErpJournalEntry }>(
      `${BASE_J}/${id}`,
      payload,
    );
    return res.data.data;
  },

  getSourceDocument: async (id: string) => {
    const res = await axiosInstance.get<{ data: Record<string, unknown> }>(
      `${BASE_J}/${id}/source-document`,
    );
    return res.data.data;
  },

  uploadAttachment: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post(
      `${BASE_J}/${id}/attachments`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  deleteAttachment: async (id: string, attachmentId: string) => {
    const res = await axiosInstance.delete(
      `${BASE_J}/${id}/attachments/${attachmentId}`,
    );
    return res.data;
  },

  getAttachmentUrl: async (id: string, attachmentId: string) => {
    const res = await axiosInstance.get<{ url: string }>(
      `${BASE_J}/${id}/attachments/${attachmentId}/download-url`,
    );
    return res.data.url;
  },

  getPeriodOptions: async () => {
    const res = await axiosInstance.get<{ items: PeriodOption[] }>(
      `${BASE_J}/lookup/periods`,
    );
    return res.data.items;
  },

  getAccountOptions: async (search?: string) => {
    const res = await axiosInstance.get<{ items: AccountOption[] }>(
      `${BASE_J}/lookup/accounts`,
      { params: { search } },
    );
    return res.data.items;
  },

  // --- Accounting Configs ---
  getConfigs: async (params: BaseQuery) => {
    const res = await axiosInstance.get<PagedResponse<ErpAccountingConfig>>(
      BASE_C,
      { params },
    );
    return res.data;
  },

  createConfig: async (payload: AccountingConfigPayload) => {
    const res = await axiosInstance.post<{ data: ErpAccountingConfig }>(
      BASE_C,
      payload,
    );
    return res.data.data;
  },

  updateConfig: async (id: string, payload: AccountingConfigPayload) => {
    const res = await axiosInstance.patch<{ data: ErpAccountingConfig }>(
      `${BASE_C}/${id}`,
      payload,
    );
    return res.data.data;
  },

  deleteConfig: async (id: string) => {
    const res = await axiosInstance.delete(`${BASE_C}/${id}`);
    return res.data;
  },
};
