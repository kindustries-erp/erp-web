import { describe, expect, it, vi } from "vitest";
import { TINY_PNG } from "./batchTestFixtures";
import { drawBatchCardCell, type PdfCanvas } from "./batchPdfRender";
import { layoutBatchCell } from "./layoutBatchPage";
import {
  buildBatchPdfBytes,
  buildCaptionBlocks,
  foldForPdf,
  pageCountFor,
  PDF_PER_PAGE,
} from "./exportBatchPdf";

const caption = {
  accountName: "NGUYỄN VĂN A",
  bankCode: "VCB",
  accountNumber: "0123456789",
  amount: 1500000,
  content: "HD001 2025",
};

const decode = (bytes: ArrayBuffer) =>
  new TextDecoder("latin1").decode(new Uint8Array(bytes));

describe("foldForPdf", () => {
  it("bỏ dấu và đổi đ thành d", () => {
    expect(foldForPdf("Đặng Thị Thuỷ")).toBe("Dang Thi Thuy");
  });
});

describe("buildCaptionBlocks", () => {
  it("có tên, ngân hàng và số tài khoản, số tiền định dạng, nội dung", () => {
    expect(buildCaptionBlocks(caption).map((b) => b.text)).toEqual([
      "NGUYEN VAN A",
      "VCB - 0123456789",
      "So tien: 1.500.000 VND",
      "Noi dung: HD001 2025",
    ]);
  });

  it("không có số tiền thì ghi là người chuyển tự nhập", () => {
    expect(buildCaptionBlocks({ ...caption, amount: null })[2].text).toBe(
      "So tien: tu nhap",
    );
  });

  it("tên và số tiền in đậm, tên tối đa 2 dòng, nội dung tối đa 2 dòng", () => {
    const [name, bank, amount, content] = buildCaptionBlocks(caption);
    expect(name.bold).toBe(true);
    expect(name.maxLines).toBe(2);
    expect(bank.maxLines).toBe(1);
    expect(amount.bold).toBe(true);
    expect(content.maxLines).toBe(2);
  });
});

describe("pageCountFor", () => {
  it("6 mã mỗi trang, tối thiểu 1 trang", () => {
    expect(PDF_PER_PAGE).toBe(6);
    expect(pageCountFor(0)).toBe(1);
    expect(pageCountFor(6)).toBe(1);
    expect(pageCountFor(7)).toBe(2);
    expect(pageCountFor(13)).toBe(3);
  });
});

describe("buildBatchPdfBytes", () => {
  const makeItems = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      fileName: `${String(i + 1).padStart(2, "0")}.png`,
      qrDataUrl: TINY_PNG,
      caption,
    }));

  it("tạo PDF thật với số trang đúng số mã", async () => {
    const bytes = await buildBatchPdfBytes(makeItems(7));
    const text = decode(bytes);
    expect(text.startsWith("%PDF")).toBe(true);
    const pages = text.match(/\/Type\s*\/Page(?!s)/g) ?? [];
    expect(pages).toHaveLength(2);
  });

  it("một mã vẫn ra một trang", async () => {
    const text = decode(await buildBatchPdfBytes(makeItems(1)));
    expect(text.match(/\/Type\s*\/Page(?!s)/g)).toHaveLength(1);
  });

  it("nhúng cardImageDataUrl vẫn xuất PDF đúng số trang", async () => {
    const items = makeItems(2).map((item) => ({
      ...item,
      cardImageDataUrl: TINY_PNG,
      cardWidth: 340,
      cardHeight: 480,
    }));
    const text = decode(await buildBatchPdfBytes(items));
    expect(text.startsWith("%PDF")).toBe(true);
    expect(text.match(/\/Type\s*\/Page(?!s)/g)).toHaveLength(1);
  });
});

describe("drawBatchCardCell", () => {
  const createMockCanvas = () => ({
    addImage: vi.fn<PdfCanvas["addImage"]>(),
    rect: vi.fn(),
    roundedRect: vi.fn<PdfCanvas["roundedRect"]>(),
    line: vi.fn(),
    text: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setDrawColor: vi.fn(),
    setFillColor: vi.fn(),
    setTextColor: vi.fn(),
    splitTextToSize: vi.fn((t: string) => [t]),
    getTextWidth: vi.fn((t: string) => t.length),
  });

  it("khi có cardImageDataUrl thì vẽ ảnh thẻ giữ tỷ lệ và không vẽ khung vector fallback", () => {
    const doc = createMockCanvas();
    const cell = layoutBatchCell(0);
    drawBatchCardCell(doc, cell, 0, {
      fileName: "01.png",
      qrDataUrl: TINY_PNG,
      cardImageDataUrl: "data:image/png;base64,CARD",
      cardWidth: 340,
      cardHeight: 480,
      caption,
    });

    expect(doc.addImage).toHaveBeenCalledTimes(1);
    const [dataUrl, fmt, , , w, h] = doc.addImage.mock.calls[0];
    expect(dataUrl).toBe("data:image/png;base64,CARD");
    expect(fmt).toBe("PNG");
    expect(w / h).toBeCloseTo(340 / 480, 4);
    expect(doc.roundedRect).not.toHaveBeenCalled();
  });

  it("khi thiếu cardImageDataUrl thì fallback vẽ thẻ vector với qrDataUrl thô", () => {
    const doc = createMockCanvas();
    const cell = layoutBatchCell(0);
    drawBatchCardCell(doc, cell, 0, {
      fileName: "01.png",
      qrDataUrl: TINY_PNG,
      caption,
    });

    expect(doc.addImage).toHaveBeenCalledWith(
      TINY_PNG,
      "PNG",
      cell.qrX,
      cell.qrY,
      cell.qrSize,
      cell.qrSize,
    );
    expect(doc.roundedRect).toHaveBeenCalled();
  });
});
