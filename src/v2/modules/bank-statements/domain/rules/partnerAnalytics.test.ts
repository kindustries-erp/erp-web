import { describe, expect, it } from "vitest";
import { analyticsTotalsOf } from "./partnerAnalytics";

describe("analyticsTotalsOf", () => {
  it("dùng tổng API trả về khi có", () => {
    expect(
      analyticsTotalsOf({
        totalCashIn: 100,
        totalCashOut: 40,
        netCashFlow: 60,
        cashTrend: [],
      }),
    ).toEqual({ cashIn: 100, cashOut: 40, net: 60 });
  });

  it("thiếu tổng thì cộng từ chuỗi theo kỳ", () => {
    expect(
      analyticsTotalsOf({
        cashTrend: [
          { label: "T1", cashIn: 30, cashOut: 10 },
          { label: "T2", cashIn: 20, cashOut: 5 },
        ],
      }),
    ).toEqual({ cashIn: 50, cashOut: 15, net: 35 });
  });

  it("không có dữ liệu thì bằng 0", () => {
    expect(analyticsTotalsOf(undefined)).toEqual({
      cashIn: 0,
      cashOut: 0,
      net: 0,
    });
  });
});
