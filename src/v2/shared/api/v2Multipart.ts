import { v2HttpClient } from "./v2HttpClient";

export interface V2MultipartOptions {
  /** Tên field chứa file (mặc định `file`) */
  fieldName?: string;
  /** Các field chữ gửi kèm */
  fields?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
  /** Ghi đè timeout mặc định của client (ms) cho tác vụ chạy lâu */
  timeoutMs?: number;
}

/** Tải một file lên API V2 dạng multipart/form-data và trả về body đã parse. */
export async function postV2Multipart<T>(
  url: string,
  file: File,
  { fieldName = "file", fields, signal, timeoutMs }: V2MultipartOptions = {},
): Promise<T> {
  const form = new FormData();
  form.append(fieldName, file, file.name);
  for (const [key, value] of Object.entries(fields ?? {})) {
    if (value !== undefined && value !== null) form.append(key, String(value));
  }
  const response = await v2HttpClient.post<T>(url, form, {
    // Ghi đè JSON mặc định; trình duyệt tự thêm boundary
    headers: { "Content-Type": "multipart/form-data" },
    signal,
    ...(timeoutMs ? { timeout: timeoutMs } : {}),
  });
  return response.data;
}
