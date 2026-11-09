import { describe, expect, it } from "vitest";
import { toSummaryKeysParam } from "./toSummaryKeysParam";

describe("toSummaryKeysParam", () => {
  it("nối các key thành CSV", () => {
    expect(toSummaryKeysParam({ summaryKeys: ["totalAmount", "qty"] })).toBe(
      "totalAmount,qty",
    );
  });

  it("bỏ khoảng trắng, phần tử rỗng và key trùng", () => {
    expect(
      toSummaryKeysParam({ summaryKeys: [" totalAmount ", "", "totalAmount"] }),
    ).toBe("totalAmount");
  });

  it("trả undefined khi không có key để API không tính tổng", () => {
    expect(toSummaryKeysParam({ summaryKeys: [] })).toBeUndefined();
    expect(toSummaryKeysParam({})).toBeUndefined();
  });
});
