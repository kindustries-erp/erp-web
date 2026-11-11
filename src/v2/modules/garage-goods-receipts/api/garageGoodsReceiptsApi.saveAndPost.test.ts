import { beforeEach, describe, expect, it, vi } from "vitest";

const post = vi.fn();
const patch = vi.fn();
vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: {
    post: (...a: unknown[]) => post(...a),
    patch: (...a: unknown[]) => patch(...a),
  },
}));

import { emptyGoodsReceiptForm } from "@/v2/core/goods-receipts";
import { garageGoodsReceiptsV2Api } from "./garageGoodsReceiptsApi";

const envelope = {
  data: {
    data: {
      id: "r1",
      receiptNo: "GGR-1",
      receiptDate: "2026-11-11",
      status: "POSTED",
    },
  },
};

describe("garageGoodsReceiptsV2Api.saveAndPost", () => {
  beforeEach(() => {
    post.mockReset().mockResolvedValue(envelope);
    patch.mockReset().mockResolvedValue(envelope);
  });

  it("tạo mới: POST save-and-post một request", async () => {
    const out = await garageGoodsReceiptsV2Api.saveAndPost(
      null,
      emptyGoodsReceiptForm(),
    );
    expect(post).toHaveBeenCalledWith(
      "/api/v1/garage-goods-receipts/save-and-post",
      expect.any(Object),
    );
    expect(patch).not.toHaveBeenCalled();
    expect(out.status).toBe("POSTED");
  });

  it("sửa nháp: PATCH :id/save-and-post", async () => {
    await garageGoodsReceiptsV2Api.saveAndPost("r1", emptyGoodsReceiptForm());
    expect(patch).toHaveBeenCalledWith(
      "/api/v1/garage-goods-receipts/r1/save-and-post",
      expect.any(Object),
    );
  });
});
