/* eslint-disable @typescript-eslint/no-explicit-any */
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
  action: string;
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

export const accountingApi = {
  // --- Journal Entries ---
  getJournalEntries: async (params: JournalEntryQuery) => {
    const res = await axiosInstance.get<PagedResponse<ErpJournalEntry>>(
      "/journal-entries",
      { params },
    );
    return res.data;
  },

  getJournalEntry: async (id: string) => {
    const res = await axiosInstance.get<{ data: ErpJournalEntry }>(
      `/journal-entries/${id}`,
    );
    return res.data.data;
  },

  createJournalEntry: async (payload: any) => {
    const res = await axiosInstance.post<{ data: ErpJournalEntry }>(
      "/journal-entries",
      payload,
    );
    return res.data.data;
  },

  updateJournalEntry: async (id: string, payload: any) => {
    const res = await axiosInstance.patch<{ data: ErpJournalEntry }>(
      `/journal-entries/${id}`,
      payload,
    );
    return res.data.data;
  },

  getSourceDocument: async (id: string) => {
    const res = await axiosInstance.get<{ data: any }>(
      `/journal-entries/${id}/source-document`,
    );
    return res.data.data;
  },

  uploadAttachment: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post(
      `/journal-entries/${id}/attachments`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  deleteAttachment: async (id: string, attachmentId: string) => {
    const res = await axiosInstance.delete(
      `/journal-entries/${id}/attachments/${attachmentId}`,
    );
    return res.data;
  },

  getAttachmentUrl: async (id: string, attachmentId: string) => {
    const res = await axiosInstance.get<{ url: string }>(
      `/journal-entries/${id}/attachments/${attachmentId}/download-url`,
    );
    return res.data.url;
  },

  getPeriodOptions: async () => {
    const res = await axiosInstance.get<{ items: any[] }>(
      "/journal-entries/options/periods",
    );
    return res.data.items;
  },

  getAccountOptions: async (search?: string) => {
    const res = await axiosInstance.get<{ items: any[] }>(
      "/journal-entries/options/accounts",
      { params: { search } },
    );
    return res.data.items;
  },

  // --- Accounting Configs ---
  getConfigs: async (params: BaseQuery) => {
    const res = await axiosInstance.get<PagedResponse<ErpAccountingConfig>>(
      "/accounting-configs-core",
      { params },
    );
    return res.data;
  },

  createConfig: async (payload: any) => {
    const res = await axiosInstance.post<{ data: ErpAccountingConfig }>(
      "/accounting-configs-core",
      payload,
    );
    return res.data.data;
  },

  updateConfig: async (id: string, payload: any) => {
    const res = await axiosInstance.patch<{ data: ErpAccountingConfig }>(
      `/accounting-configs-core/${id}`,
      payload,
    );
    return res.data.data;
  },

  deleteConfig: async (id: string) => {
    const res = await axiosInstance.delete(`/accounting-configs-core/${id}`);
    return res.data;
  },
};
