import { describe, expect, it } from "vitest";
import {
  formatSubtotalValue,
  isMultiPage,
  ratioPct,
  resolveCumulative,
} from "./V2SubtotalSummaryCell.utils";

describe("ratioPct", () => {
  it("tính tỷ lệ một chữ số thập phân", () => {
    expect(ratioPct(1, 3)).toBe(33.3);
  });

  it("dùng giá trị tuyệt đối, kết quả luôn trong [0, 100]", () => {
    expect(ratioPct(-50, 100)).toBe(50);
    expect(ratioPct(250, 100)).toBe(100);
  });

  it("tổng bằng 0 thì trả về 0", () => {
    expect(ratioPct(10, 0)).toBe(0);
  });
});

describe("resolveCumulative", () => {
  it("ưu tiên giá trị lũy kế truyền vào", () => {
    expect(resolveCumulative(3, 10, 99)).toBe(99);
  });

  it("ở trang 1 thì lũy kế bằng trang hiện tại", () => {
    expect(resolveCumulative(1, 10)).toBe(10);
  });

  it("ở trang sau mà không có lũy kế thì trả về undefined", () => {
    expect(resolveCumulative(2, 10)).toBeUndefined();
  });
});

describe("isMultiPage", () => {
  it("chỉ true khi có hơn 1 trang", () => {
    expect(isMultiPage(1)).toBe(false);
    expect(isMultiPage(2)).toBe(true);
  });
});

describe("formatSubtotalValue", () => {
  it("định dạng thành tiền có đơn vị đồng", () => {
    expect(formatSubtotalValue("amount", 1500, undefined, "vi-VN")).toBe(
      "1.500 đ",
    );
  });

  it("số lượng và số dòng gắn đơn vị nếu có", () => {
    expect(formatSubtotalValue("qty", 1200, "kg", "vi-VN")).toBe("1.200 kg");
    expect(formatSubtotalValue("count", 7, undefined, "vi-VN")).toBe("7");
  });
});
