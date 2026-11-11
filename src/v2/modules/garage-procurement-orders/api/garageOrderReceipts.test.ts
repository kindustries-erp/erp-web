import { beforeEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/v2/shared/api/v2HttpClient", () => ({ v2HttpClient: { get } }));

import { listGarageOrderReceipts } from "./garageOrderReceipts";

describe("listGarageOrderReceipts", () => {
  beforeEach(() => get.mockReset());

  it("lọc phiếu theo mã đơn mua và đổi về dòng lịch sử", async () => {
    get.mockResolvedValue({
      data: {
        items: [
          {
            id: "r1",
            receiptNo: "GGR-1",
            receiptDate: "2026-11-11",
            status: "POSTED",
            totalAmount: "650",
          },
        ],
      },
    });
    const rows = await listGarageOrderReceipts("po-1");
    const params = get.mock.calls[0][1].params;
    expect(get.mock.calls[0][0]).toBe("/api/v1/garage-goods-receipts");
    expect(JSON.parse(params.column_filters)).toEqual({
      garageProcurementOrderId: ["po-1"],
    });
    expect(rows).toEqual([
      {
        id: "r1",
        receiptNo: "GGR-1",
        receiptDate: "2026-11-11",
        status: "POSTED",
        totalAmount: "650",
      },
    ]);
  });
});
