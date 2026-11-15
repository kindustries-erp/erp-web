export interface V2PageWindow {
  start: number;
  end: number;
  showFirst: boolean;
  showFirstGap: boolean;
  showLast: boolean;
  showLastGap: boolean;
}

/** Cửa sổ số trang quanh trang hiện tại, trang đầu/cuối kèm dấu "…" như V1 */
export const getPageWindow = (
  page: number,
  totalPages: number,
  maxShow = 5,
): V2PageWindow => {
  const pages = Math.max(0, totalPages);
  if (pages === 0) {
    return {
      start: 1,
      end: 0,
      showFirst: false,
      showFirstGap: false,
      showLast: false,
      showLastGap: false,
    };
  }
  const current = Math.min(Math.max(1, page), pages);
  let start = Math.max(1, current - Math.floor(maxShow / 2));
  const end = Math.min(pages, start + maxShow - 1);
  if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1);
  return {
    start,
    end,
    showFirst: start > 1,
    showFirstGap: start > 2,
    showLast: end < pages,
    showLastGap: end < pages - 1,
  };
};

export interface V2PageChunk {
  start: number;
  end: number;
  label: string;
}

/** Tự động chọn kích thước mỗi cụm trang theo tổng số trang để thanh chip luôn gọn nhẹ */
export const resolveChunkSize = (totalPages: number): number => {
  if (totalPages <= 400) return 20;
  if (totalPages <= 1000) return 50;
  return 100;
};

/** Chia danh sách trang thành các cụm liên tiếp (vd: 1–20, 21–40, ...) cho mobile bottom sheet */
export const buildPageChunks = (totalPages: number): V2PageChunk[] => {
  const safeTotal = Math.max(0, totalPages);
  if (safeTotal === 0) return [];
  const chunkSize = resolveChunkSize(safeTotal);
  const chunks: V2PageChunk[] = [];
  for (let start = 1; start <= safeTotal; start += chunkSize) {
    const end = Math.min(safeTotal, start + chunkSize - 1);
    chunks.push({
      start,
      end,
      label: start === end ? `${start}` : `${start}–${end}`,
    });
  }
  return chunks;
};

/** Tìm index cụm đang chứa trang `page` */
export const findChunkIndexForPage = (
  chunks: readonly V2PageChunk[],
  page: number,
): number => {
  if (chunks.length === 0) return 0;
  const idx = chunks.findIndex((c) => page >= c.start && page <= c.end);
  return idx >= 0 ? idx : 0;
};
