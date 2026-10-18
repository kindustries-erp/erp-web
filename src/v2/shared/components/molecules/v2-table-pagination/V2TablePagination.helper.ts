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
