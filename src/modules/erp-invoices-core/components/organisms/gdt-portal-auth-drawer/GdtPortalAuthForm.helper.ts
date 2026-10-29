import { solveGdtSvgCaptcha } from "@/modules/erp-invoices-core/utils/gdtCaptchaSolver";

/** Captcha đã chuẩn hóa để hiển thị: ảnh, khóa xác thực và chữ tự giải (nếu có) */
export interface CaptchaView {
  key: string;
  img: string;
  autoText: string;
}

/** Đổi nội dung captcha từ server thành data URL hiển thị được */
export function formatCaptchaImage(rawContent: string): string {
  if (rawContent.startsWith("<svg") || rawContent.includes("<svg")) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(rawContent)}`;
  }
  if (!rawContent.startsWith("data:")) {
    return `data:image/png;base64,${rawContent}`;
  }
  return rawContent;
}

/**
 * Chuẩn hóa response captcha. Trả về `null` khi server không có khóa (không hiển thị được).
 * Nếu server không gửi chữ sẵn thì tự giải từ SVG.
 */
export function buildCaptchaView(
  res: {
    key?: string;
    content?: string;
    text?: string;
  } | null,
): CaptchaView | null {
  if (!res?.key) return null;
  const rawContent = res.content || "";
  const autoText =
    res.text || (rawContent ? solveGdtSvgCaptcha(rawContent) : "");
  return {
    key: res.key,
    img: formatCaptchaImage(rawContent),
    autoText,
  };
}
