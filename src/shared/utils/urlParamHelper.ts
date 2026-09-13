/**
 * URL Param Helper & Value Compression Utilities
 * Cung cấp các công cụ tối ưu hóa, rút gọn và phân tích giá trị query params trên URL.
 */

/**
 * Nén UUID từ 36 ký tự (có dấu gạch ngang) sang 32 ký tự hex không dấu gạch ngang.
 */
export function compressUuid(uuid: string): string {
  if (!uuid || typeof uuid !== "string") return uuid;
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
  ) {
    return uuid.replace(/-/g, "");
  }
  return uuid;
}

/**
 * Khôi phục chuỗi 32 ký tự hex về định dạng UUID chuẩn 36 ký tự.
 */
export function decompressUuid(compact: string): string {
  if (!compact || typeof compact !== "string") return compact;
  if (/^[0-9a-f]{32}$/i.test(compact)) {
    return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
  }
  return compact;
}

/**
 * Escape các ký tự phân tách nội bộ (delimiter: | và , và :) trong compact query format.
 */
export function escapeParamToken(token: string): string {
  if (!token) return "";
  return token
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/,/g, "\\,")
    .replace(/:/g, "\\:");
}

/**
 * Unescape các ký tự phân tách nội bộ.
 */
export function unescapeParamToken(token: string): string {
  if (!token) return "";
  return token
    .replace(/\\:/g, ":")
    .replace(/\\,/g, ",")
    .replace(/\\\|/g, "|")
    .replace(/\\\\/g, "\\");
}

/**
 * Trích xuất mã số thuế hoặc định danh ngắn từ chuỗi thông tin đối tác nếu có.
 * Ví dụ: "CHI NHÁNH CÔNG TY ABC - MST: 0105802119-001" -> "0105802119-001"
 */
export function extractShortPartnerIdentifier(partnerStr: string): string {
  if (!partnerStr || typeof partnerStr !== "string") return partnerStr;
  const match = partnerStr.match(/MST:\s*([0-9A-Za-z-]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return partnerStr.trim();
}
