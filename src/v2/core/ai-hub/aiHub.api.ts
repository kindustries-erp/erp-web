import { postV2Multipart } from "@/v2/shared/api/v2Multipart";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  AiCreateRequestPayload,
  AiCreateRequestResult,
  AiInvoiceApi,
  AiInvoicePreview,
} from "./aiHub.type";

/** Đọc hóa đơn có thể mất hơn một phút; API chờ model tối đa 120 giây, web chờ lâu hơn một chút. */
export const AI_INVOICE_PREVIEW_TIMEOUT_MS = 200_000;
export const AI_INVOICE_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
export const AI_INVOICE_MAX_BYTES = 10 * 1024 * 1024;

/** Tạo API trợ lý hóa đơn cho một đường dẫn gốc, vd `/api/v2/ai-hub-garage`. */
export function createAiInvoiceApi(basePath: string): AiInvoiceApi {
  const base = basePath.replace(/\/+$/, "");
  return {
    previewInvoice: (file, signal) =>
      postV2Multipart<AiInvoicePreview>(`${base}/invoice-preview`, file, {
        signal,
        timeoutMs: AI_INVOICE_PREVIEW_TIMEOUT_MS,
      }),
    createRequest: async (payload: AiCreateRequestPayload) => {
      const response = await v2HttpClient.post<AiCreateRequestResult>(
        `${base}/purchase-requests`,
        payload,
      );
      return response.data;
    },
  };
}
