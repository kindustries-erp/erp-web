import { beforeEach, describe, expect, it, vi } from "vitest";
import { TINY_PNG } from "./batchTestFixtures";
import { downloadBatchPdf, type BatchDownloadItem } from "./batchDownloads";
import { buildBatchPdfBytes } from "./exportBatchPdf";
import { cardElementToPng } from "./exportCardImage";

vi.mock("./exportCardImage", () => ({
  cardElementToPng: vi.fn(),
}));

vi.mock("./exportBatchPdf", () => ({
  batchPdfFileName: vi.fn(() => "QR_nhieu_lenh_test.pdf"),
  buildBatchPdfBytes: vi.fn(async () => new ArrayBuffer(8)),
}));

vi.mock("./downloadBlob", () => ({
  downloadBlob: vi.fn(),
  downloadDataUrl: vi.fn(),
}));

const sampleItem: BatchDownloadItem = {
  fileName: "01_QR_VCB_0123456789.png",
  qrDataUrl: TINY_PNG,
  caption: {
    accountName: "NGUYỄN VĂN A",
    bankCode: "VCB",
    accountNumber: "0123456789",
    amount: 100000,
    content: "TT",
  },
};

describe("downloadBatchPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chụp DOM TransferQrPaymentCard khi có getCardElement và truyền vào buildBatchPdfBytes", async () => {
    vi.mocked(cardElementToPng).mockResolvedValueOnce(
      "data:image/png;base64,CARD",
    );
    const fakeEl = {
      offsetWidth: 340,
      offsetHeight: 490,
      getBoundingClientRect: () => ({ width: 340, height: 490 }),
    } as unknown as HTMLElement;

    await downloadBatchPdf(
      [sampleItem],
      new Date("2026-11-26T10:00:00Z"),
      () => fakeEl,
    );

    expect(cardElementToPng).toHaveBeenCalledWith(fakeEl);
    expect(buildBatchPdfBytes).toHaveBeenCalledWith([
      expect.objectContaining({
        fileName: sampleItem.fileName,
        cardImageDataUrl: "data:image/png;base64,CARD",
        cardWidth: 340,
        cardHeight: 490,
      }),
    ]);
  });

  it("fallback về item gốc khi cardElementToPng lỗi", async () => {
    vi.mocked(cardElementToPng).mockRejectedValueOnce(
      new Error("canvas error"),
    );
    const fakeEl = {
      offsetWidth: 340,
      offsetHeight: 490,
      getBoundingClientRect: () => ({ width: 340, height: 490 }),
    } as unknown as HTMLElement;

    await downloadBatchPdf(
      [sampleItem],
      new Date("2026-11-26T10:00:00Z"),
      () => fakeEl,
    );

    const passedItems = vi.mocked(buildBatchPdfBytes).mock.calls[0][0];
    expect(passedItems[0].cardImageDataUrl).toBeUndefined();
    expect(passedItems[0].qrDataUrl).toBe(TINY_PNG);
  });
});
