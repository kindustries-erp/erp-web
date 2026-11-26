/**
 * Bố cục thuần (không phụ thuộc jsPDF) cho trang PDF A4 của lô QR.
 * Tọa độ đơn vị mm, gốc ở góc trên bên trái trang.
 */
export const PDF_COLUMNS = 2;
export const PDF_ROWS = 3;
export const PDF_PER_PAGE = PDF_COLUMNS * PDF_ROWS;

export const PAGE_WIDTH_MM = 210;
export const PAGE_HEIGHT_MM = 297;
export const PAGE_MARGIN_MM = 10;
export const PAGE_TOP_MARGIN_MM = 19;
export const PAGE_BOTTOM_MARGIN_MM = 12;
export const CELL_GAP_MM = 4;
export const CELL_PADDING_MM = 4;
export const QR_SIZE_MM = 36;
export const CARD_HEADER_HEIGHT_MM = 8;
const QR_TOP_OFFSET_MM = 10.5;
const TEXT_GAP_MM = 3;

export interface BatchCellLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  qrX: number;
  qrY: number;
  qrSize: number;
  /** Tâm ngang của ô; mọi chữ canh giữa quanh trục này. */
  centerX: number;
  /** Đỉnh khối chữ, nằm ngay dưới QR. */
  textTopY: number;
  /** Chiều rộng tối đa cho một dòng chữ. */
  textWidth: number;
  headerHeight: number;
}

export const cellWidthMm = (): number =>
  (PAGE_WIDTH_MM - PAGE_MARGIN_MM * 2 - CELL_GAP_MM * (PDF_COLUMNS - 1)) /
  PDF_COLUMNS;

export const cellHeightMm = (): number =>
  (PAGE_HEIGHT_MM -
    PAGE_TOP_MARGIN_MM -
    PAGE_BOTTOM_MARGIN_MM -
    CELL_GAP_MM * (PDF_ROWS - 1)) /
  PDF_ROWS;

/** Vị trí ô theo thứ tự trong trang (0..PDF_PER_PAGE-1). */
export function layoutBatchCell(slot: number): BatchCellLayout {
  const width = cellWidthMm();
  const height = cellHeightMm();
  const column = slot % PDF_COLUMNS;
  const row = Math.floor(slot / PDF_COLUMNS);
  const x = PAGE_MARGIN_MM + column * (width + CELL_GAP_MM);
  const y = PAGE_TOP_MARGIN_MM + row * (height + CELL_GAP_MM);
  const centerX = x + width / 2;
  const qrY = y + QR_TOP_OFFSET_MM;
  return {
    x,
    y,
    width,
    height,
    qrX: centerX - QR_SIZE_MM / 2,
    qrY,
    qrSize: QR_SIZE_MM,
    centerX,
    textTopY: qrY + QR_SIZE_MM + TEXT_GAP_MM,
    textWidth: width - CELL_PADDING_MM * 2,
    headerHeight: CARD_HEADER_HEIGHT_MM,
  };
}

/** Chiều cao một dòng chữ theo cỡ chữ (pt). */
export const lineHeightMm = (fontSizePt: number): number => fontSizePt * 0.45;

export type WrapFn = (text: string, maxWidth: number) => string[];
export type MeasureFn = (text: string) => number;

/**
 * Ngắt chữ theo chiều rộng, giới hạn số dòng. Nếu vượt, dòng cuối được rút
 * ngắn và thêm "..." sao cho vẫn nằm trong `maxWidth`.
 */
export function fitTextLines(
  text: string,
  maxLines: number,
  maxWidth: number,
  wrap: WrapFn,
  measure: MeasureFn,
): string[] {
  const all = wrap(text, maxWidth);
  if (all.length <= maxLines) return all;
  const kept = all.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last.length > 0 && measure(`${last}...`) > maxWidth) {
    last = last.slice(0, -1);
  }
  kept[maxLines - 1] = `${last.trimEnd()}...`;
  return kept;
}

export interface FittedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Tính khung hình chữ nhật lớn nhất nằm gọn trong hộp đích, giữ nguyên tỷ lệ gốc và căn giữa.
 * Nếu kích thước nguồn không hợp lệ (<= 0), trả về nguyên hộp đích.
 */
export function fitRectInBox(
  srcWidth: number,
  srcHeight: number,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
): FittedRect {
  if (srcWidth <= 0 || srcHeight <= 0 || boxWidth <= 0 || boxHeight <= 0) {
    return { x: boxX, y: boxY, width: boxWidth, height: boxHeight };
  }
  const scale = Math.min(boxWidth / srcWidth, boxHeight / srcHeight);
  const width = srcWidth * scale;
  const height = srcHeight * scale;
  return {
    x: boxX + (boxWidth - width) / 2,
    y: boxY + (boxHeight - height) / 2,
    width,
    height,
  };
}
