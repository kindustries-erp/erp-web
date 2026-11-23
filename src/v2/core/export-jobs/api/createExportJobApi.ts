import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { readBlobErrorMessage } from "../helpers/readBlobErrorMessage";
import type {
  ExportHistoryResponse,
  ExportStartResult,
} from "../types/exportJobs.types";

/**
 * Tạo client API cho một job xuất nền: bắt đầu, lịch sử, tải file.
 * `basePath` là đường dẫn `.../export/excel/background` của module.
 */
export function createExportJobApi<
  TQuery,
  TStart extends ExportStartResult = ExportStartResult,
  THistory extends ExportHistoryResponse = ExportHistoryResponse,
>(basePath: string) {
  return {
    startBackgroundExport: async (payload: TQuery): Promise<TStart> => {
      try {
        const { data } = await v2HttpClient.post<TStart>(basePath, payload);
        return data;
      } catch (error) {
        throw new Error(extractV2ApiError(error, ""));
      }
    },

    listBackgroundHistory: async (
      page = 1,
      pageSize = 10,
    ): Promise<THistory> => {
      const { data } = await v2HttpClient.get<THistory>(`${basePath}/history`, {
        params: { page, pageSize },
      });
      return data;
    },

    downloadBackgroundFile: async (jobId: string): Promise<Blob> => {
      try {
        const { data } = await v2HttpClient.get<Blob>(
          `${basePath}/${encodeURIComponent(jobId)}/download`,
          { responseType: "blob" },
        );
        return data;
      } catch (error) {
        throw new Error(await readBlobErrorMessage(error));
      }
    },
  };
}
