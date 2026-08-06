import { AxiosError } from "axios";

import axiosInstance from "@/core/api/axiosInstance";

const BASE = "/api/v1/reports/vinfast-parts/export/excel/background";

export interface VinfastPartsExportQuery {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  sorts?: string;
  columnSearch?: string;
  columnFilters?: string;
}

export interface VinfastPartsExportStartResult {
  jobId: string;
  message: string;
  reused?: boolean;
}

export interface VinfastPartsExportHistoryItem {
  jobId: string;
  fileName: string;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  current: number;
  total: number;
  message: string;
  createdAt: string;
  finishedAt?: string;
  expiresAt?: string;
  dateFrom?: string;
  dateTo?: string;
  canDownload: boolean;
}

export interface VinfastPartsExportHistoryResponse {
  items: VinfastPartsExportHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VinfastPartsExportProgressEvent {
  processId: "vinfast-parts-xlsx-export" | "ping";
  userId?: string;
  jobId?: string;
  current: number;
  total: number;
  isRunning: boolean;
  completed: boolean;
  ready: boolean;
  failed: boolean;
  message?: string;
  fileName?: string;
}

async function resolveBlobErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<Blob | { message?: string }>;
  const data = axiosError.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      if (text) {
        const parsed = JSON.parse(text) as { message?: string };
        if (parsed?.message) return parsed.message;
      }
    } catch {
      // Ignore parse errors and fall back to default.
    }
  } else if (typeof data === "object" && data?.message) {
    return data.message;
  }

  return fallback;
}

export const vinfastPartsExportApi = {
  startBackgroundExport: async (
    payload: VinfastPartsExportQuery,
  ): Promise<VinfastPartsExportStartResult> => {
    const { data } = await axiosInstance.post<VinfastPartsExportStartResult>(
      BASE,
      payload,
    );
    return data;
  },

  listBackgroundHistory: async (
    page = 1,
    pageSize = 10,
  ): Promise<VinfastPartsExportHistoryResponse> => {
    const { data } = await axiosInstance.get<VinfastPartsExportHistoryResponse>(
      `${BASE}/history`,
      {
        params: {
          page,
          pageSize,
        },
      },
    );
    return data;
  },

  downloadBackgroundFile: async (jobId: string): Promise<Blob> => {
    try {
      const { data } = await axiosInstance.get<Blob>(
        `${BASE}/${encodeURIComponent(jobId)}/download`,
        {
          responseType: "blob",
        },
      );
      return data;
    } catch (error) {
      throw new Error(
        await resolveBlobErrorMessage(error, "Khong the tai lai file XLSX."),
      );
    }
  },

  extractDownloadFileName(headers: Record<string, string>, fallback?: string) {
    const contentDisposition =
      headers["content-disposition"] || headers["Content-Disposition"];

    const quotedFileName = contentDisposition
      ?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i)?.[1]
      ?.trim();

    const rawFileName = (quotedFileName || fallback || "vinfast-parts.xlsx")
      .replace(/"/g, "")
      .trim();

    try {
      return decodeURIComponent(rawFileName);
    } catch {
      return rawFileName;
    }
  },
};
