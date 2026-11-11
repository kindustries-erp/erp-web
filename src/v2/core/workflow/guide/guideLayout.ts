/**
 * Kích thước trang hướng dẫn A4 dọc, tính bằng px ở 96dpi (794 × 1123 ≈ 210 × 297 mm).
 * Trang được dựng bằng HTML rồi chụp thành ảnh để đưa vào PDF.
 */
export const GUIDE_PAGE = { width: 794, height: 1123 } as const;
export const GUIDE_PAGE_MM = { width: 210, height: 297 } as const;

export const GUIDE_MARGIN_X = 48;
export const GUIDE_MARGIN_TOP = 44;
export const GUIDE_MARGIN_BOTTOM = 36;
export const GUIDE_HEADER_HEIGHT = 30;
export const GUIDE_FOOTER_HEIGHT = 26;

/** Bề rộng vùng nội dung của một trang. */
export const GUIDE_CONTENT_WIDTH = GUIDE_PAGE.width - GUIDE_MARGIN_X * 2;

/** Chiều cao tối đa của vùng nội dung (trừ lề, đầu trang, chân trang và khoảng cách). */
export const GUIDE_CONTENT_HEIGHT =
  GUIDE_PAGE.height -
  GUIDE_MARGIN_TOP -
  GUIDE_MARGIN_BOTTOM -
  GUIDE_HEADER_HEIGHT -
  GUIDE_FOOTER_HEIGHT -
  24;
