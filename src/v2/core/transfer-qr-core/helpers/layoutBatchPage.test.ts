import { describe, expect, it } from "vitest";
import {
  CELL_GAP_MM,
  PAGE_HEIGHT_MM,
  PAGE_MARGIN_MM,
  PAGE_WIDTH_MM,
  PDF_PER_PAGE,
  QR_SIZE_MM,
  fitTextLines,
  layoutBatchCell,
} from "./layoutBatchPage";

// Giả lập đo chữ: mỗi ký tự rộng 1mm; ngắt theo khoảng trắng.
const measure = (text: string) => text.length;
const wrap = (text: string, maxWidth: number): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (measure(next) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
};

describe("layoutBatchCell", () => {
  it("6 ô đều nằm trong lề A4 và không chồng lên nhau", () => {
    const cells = Array.from({ length: PDF_PER_PAGE }, (_, slot) =>
      layoutBatchCell(slot),
    );
    for (const cell of cells) {
      expect(cell.x).toBeGreaterThanOrEqual(PAGE_MARGIN_MM - 1e-9);
      expect(cell.y).toBeGreaterThanOrEqual(PAGE_MARGIN_MM - 1e-9);
      expect(cell.x + cell.width).toBeLessThanOrEqual(
        PAGE_WIDTH_MM - PAGE_MARGIN_MM + 1e-9,
      );
      expect(cell.y + cell.height).toBeLessThanOrEqual(
        PAGE_HEIGHT_MM - PAGE_MARGIN_MM + 1e-9,
      );
    }
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i];
        const b = cells[j];
        const overlapX = a.x < b.x + b.width && b.x < a.x + a.width;
        const overlapY = a.y < b.y + b.height && b.y < a.y + a.height;
        expect(overlapX && overlapY).toBe(false);
      }
    }
  });

  it("QR canh giữa ngang trong ô", () => {
    const cell = layoutBatchCell(0);
    expect(cell.qrSize).toBe(QR_SIZE_MM);
    expect(cell.qrX + cell.qrSize / 2).toBeCloseTo(cell.centerX, 6);
    expect(cell.centerX).toBeCloseTo(cell.x + cell.width / 2, 6);
  });

  it("khối chữ nằm gọn trong ô, dưới QR", () => {
    for (let slot = 0; slot < PDF_PER_PAGE; slot++) {
      const cell = layoutBatchCell(slot);
      expect(cell.textTopY).toBeGreaterThan(cell.qrY + cell.qrSize);
      expect(cell.textTopY).toBeLessThan(cell.y + cell.height);
      expect(cell.textWidth).toBeGreaterThan(0);
      expect(cell.textWidth).toBeLessThan(cell.width);
    }
  });

  it("cột phải bắt đầu sau cột trái cộng khoảng cách", () => {
    const left = layoutBatchCell(0);
    const right = layoutBatchCell(1);
    expect(right.x - (left.x + left.width)).toBeCloseTo(CELL_GAP_MM, 6);
    expect(layoutBatchCell(2).y).toBeGreaterThan(left.y + left.height);
  });
});

describe("fitTextLines", () => {
  it("giữ nguyên khi đủ số dòng", () => {
    expect(fitTextLines("ten ngan", 2, 20, wrap, measure)).toEqual([
      "ten ngan",
    ]);
  });

  it("ngắt thành nhiều dòng khi vượt chiều rộng", () => {
    expect(fitTextLines("aaa bbb ccc", 3, 7, wrap, measure)).toEqual([
      "aaa bbb",
      "ccc",
    ]);
  });

  it("vượt số dòng tối đa thì cắt và thêm ... trong chiều rộng", () => {
    const lines = fitTextLines(
      "NGUYEN VAN AAAA BBBB CCCC DDDD",
      2,
      12,
      wrap,
      measure,
    );
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith("...")).toBe(true);
    for (const line of lines) expect(measure(line)).toBeLessThanOrEqual(12);
  });

  it("chuỗi rỗng trả về mảng rỗng", () => {
    expect(fitTextLines("", 2, 10, wrap, measure)).toEqual([]);
  });
});
