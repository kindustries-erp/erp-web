import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type {
  VinfastPartsStockExportHistoryResponse,
  VinfastPartsStockExportQuery,
  VinfastPartsStockExportStartResult,
} from "./dtos/vinfastStockExport.dto";

const BASE = "/api/v1/vinfast-parts/stock/export/excel/background";

/** Lỗi trả về là message của server; rỗng thì UI tự dùng chuỗi đã dịch */
const readBlobErrorMessage = async (error: unknown): Promise<string> => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text()) as { message?: string };
      return parsed.message ?? "";
    } catch {
      return "";
    }
  }
  return extractV2ApiError(error, "");
};

export const vinfastStockExportApi = {
  startBackgroundExport: async (
    payload: VinfastPartsStockExportQuery,
  ): Promise<VinfastPartsStockExportStartResult> => {
    try {
      const { data } =
        await v2HttpClient.post<VinfastPartsStockExportStartResult>(
          BASE,
          payload,
        );
      return data;
    } catch (error) {
      throw new Error(extractV2ApiError(error, ""));
    }
  },

  listBackgroundHistory: async (
    page = 1,
    pageSize = 10,
  ): Promise<VinfastPartsStockExportHistoryResponse> => {
    const { data } =
      await v2HttpClient.get<VinfastPartsStockExportHistoryResponse>(
        `${BASE}/history`,
        { params: { page, pageSize } },
      );
    return data;
  },

  downloadBackgroundFile: async (jobId: string): Promise<Blob> => {
    try {
      const { data } = await v2HttpClient.get<Blob>(
        `${BASE}/${encodeURIComponent(jobId)}/download`,
        { responseType: "blob" },
      );
      return data;
    } catch (error) {
      throw new Error(await readBlobErrorMessage(error));
    }
  },
};
