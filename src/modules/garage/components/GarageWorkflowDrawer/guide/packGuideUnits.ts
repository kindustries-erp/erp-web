/**
 * Xếp các đơn vị nội dung vào trang theo chiều cao đã đo.
 * - Đơn vị không bao giờ bị cắt đôi giữa hai trang.
 * - Đơn vị `keepWithNext` (tiêu đề) luôn đi cùng đơn vị liền sau.
 * - Đơn vị cao hơn một trang vẫn được xếp riêng, không gây treo.
 * Trả về, cho mỗi trang, danh sách chỉ số đơn vị.
 */
export function packGuideUnits(
  heights: number[],
  keepWithNext: boolean[],
  pageHeight: number,
): number[][] {
  const pages: number[][] = [];
  let current: number[] = [];
  let used = 0;

  const startNewPage = () => {
    if (current.length > 0) pages.push(current);
    current = [];
    used = 0;
  };

  for (let index = 0; index < heights.length; index += 1) {
    // Chuỗi tiêu đề liên tiếp phải đi cùng đơn vị đầu tiên không phải tiêu đề.
    let groupEnd = index;
    while (keepWithNext[groupEnd] && groupEnd + 1 < heights.length)
      groupEnd += 1;
    const groupHeight = heights
      .slice(index, groupEnd + 1)
      .reduce((sum, height) => sum + height, 0);

    if (current.length > 0 && used + groupHeight > pageHeight) startNewPage();

    for (let k = index; k <= groupEnd; k += 1) {
      if (current.length > 0 && used + heights[k] > pageHeight) startNewPage();
      current.push(k);
      used += heights[k];
    }
    index = groupEnd;
  }

  if (current.length > 0) pages.push(current);
  return pages;
}
