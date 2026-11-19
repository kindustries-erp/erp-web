import { describe, expect, it } from "vitest";
import { TINY_PNG } from "./batchTestFixtures";
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
});
