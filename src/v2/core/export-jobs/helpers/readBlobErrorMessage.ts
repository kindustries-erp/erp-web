import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";

/** Lỗi tải blob trả về là message của server; rỗng thì UI tự dùng chuỗi đã dịch */
export const readBlobErrorMessage = async (error: unknown): Promise<string> => {
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
