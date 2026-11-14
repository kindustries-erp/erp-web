import { describe, expect, it } from "vitest";
import type { AiInvoicePreview } from "../aiHub.type";
import {
  isValidDraftLine,
  toCreateRequestPayload,
  toDraftLines,
  todayIso,
} from "./aiInvoiceDraft.helper";

const preview: AiInvoicePreview = {
  invoice: {
    sellerName: "ABC",
    sellerTaxCode: null,
    invoiceNo: "0001234",
    invoiceDate: null,
    total: 1150000,
  },
  lines: [
    {
      itemName: "Lọc dầu",
      itemCode: "PT-90915",
      unit: "Cái",
      qtyRequested: 2,
      estUnitPrice: 150000,
      itemType: "PT",
      lineType: "GOODS",
      match: { status: "MATCHED", matchedBy: "CODE", itemId: "i1" },
    },
    {
      itemName: "Công thay",
      itemCode: null,
      unit: null,
      qtyRequested: 1,
      estUnitPrice: null,
      itemType: "DV",
      lineType: "SERVICE",
      match: { status: "NEW" },
    },
  ],
  warnings: [],
  ai: { tier: "low", model: "m", latencyMs: 1 },
};

describe("aiInvoiceDraft.helper", () => {
  it("toDraftLines gắn key và đổi mã null thành chuỗi rỗng", () => {
    const lines = toDraftLines(preview);
    expect(lines.map((l) => l.key)).toEqual(["line-0", "line-1"]);
    expect(lines[1].itemCode).toBe("");
  });

  it("isValidDraftLine cần tên và số lượng dương", () => {
    const [line] = toDraftLines(preview);
    expect(isValidDraftLine(line)).toBe(true);
    expect(isValidDraftLine({ ...line, qtyRequested: null })).toBe(false);
    expect(isValidDraftLine({ ...line, qtyRequested: 0 })).toBe(false);
    expect(isValidDraftLine({ ...line, itemName: " " })).toBe(false);
  });

  it("todayIso theo giờ máy", () => {
    expect(todayIso(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });

  it("toCreateRequestPayload bỏ dòng lỗi, bỏ trường rỗng, kèm chi nhánh", () => {
    const lines = toDraftLines(preview);
    lines.push({ ...lines[0], key: "x", qtyRequested: 0 });

    expect(
      toCreateRequestPayload(preview, lines, {
        branchId: "b1",
        branchName: "CN1",
        requestDate: "2026-11-12",
      }),
    ).toEqual({
      branchId: "b1",
      branchName: "CN1",
      requestDate: "2026-11-12",
      invoiceNo: "0001234",
      sellerName: "ABC",
      lines: [
        {
          itemName: "Lọc dầu",
          itemCode: "PT-90915",
          unit: "Cái",
          itemType: "PT",
          qtyRequested: 2,
          estUnitPrice: 150000,
        },
        { itemName: "Công thay", itemType: "DV", qtyRequested: 1 },
      ],
    });
  });
});
