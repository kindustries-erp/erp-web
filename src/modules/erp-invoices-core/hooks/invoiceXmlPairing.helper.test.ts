import { describe, it, expect } from "vitest";
import {
  getFilePreviewStatus,
  pairXmlWithPdf,
  splitManualMatches,
} from "./invoiceXmlPairing.helper";
import type { FileEntry } from "./invoiceXmlUpload.type";

const entry = (name: string, id: string): FileEntry => ({
  file: new File([""], name),
  id,
  type: name.toLowerCase().split(".").pop() as FileEntry["type"],
});

describe("pairXmlWithPdf", () => {
  it("ghép XML với PDF cùng tên gốc, không phân biệt hoa thường", () => {
    const paired = pairXmlWithPdf([
      entry("INV-01.XML", "x1"),
      entry("inv-01.pdf", "p1"),
    ]);

    expect(paired[0].pairedPdf).toBe("inv-01.pdf");
    expect(paired[1].pairedPdf).toBeUndefined();
  });

  it("xóa ghép cũ khi PDF đã bị gỡ khỏi danh sách", () => {
    const withPdf = pairXmlWithPdf([
      entry("a.xml", "x1"),
      entry("a.pdf", "p1"),
    ]);
    const withoutPdf = pairXmlWithPdf(withPdf.filter((e) => e.id !== "p1"));

    expect(withoutPdf[0].pairedPdf).toBeUndefined();
  });
});

describe("splitManualMatches", () => {
  it("gom PDF ghép tay theo hóa đơn đích, phần còn lại vào autoFiles", () => {
    const xml = entry("a.xml", "x1");
    const pdfA = entry("a.pdf", "p1");
    const pdfB = entry("b.pdf", "p2");

    const { autoFiles, manualFiles } = splitManualMatches([xml, pdfA, pdfB], {
      p1: "inv-1",
      p2: "inv-1",
    });

    expect(autoFiles).toEqual([xml.file]);
    expect(manualFiles.get("inv-1")).toEqual([pdfA.file, pdfB.file]);
  });

  it("PDF không có lựa chọn ghép tay vẫn đi vào autoFiles", () => {
    const pdf = entry("c.pdf", "p3");

    const { autoFiles, manualFiles } = splitManualMatches([pdf], undefined);

    expect(autoFiles).toEqual([pdf.file]);
    expect(manualFiles.size).toBe(0);
  });
});

describe("getFilePreviewStatus", () => {
  it("phân loại theo loại file", () => {
    expect(getFilePreviewStatus(entry("a.xml", "1"))).toBe("new-invoice");
    expect(getFilePreviewStatus(entry("a.pdf", "2"))).toBe("attach-pdf");
    expect(getFilePreviewStatus(entry("a.zip", "3"))).toBe("extract-zip");
  });
});
