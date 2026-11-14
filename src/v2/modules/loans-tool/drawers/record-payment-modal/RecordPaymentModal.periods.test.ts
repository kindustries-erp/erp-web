import { describe, expect, it } from "vitest";
import type { LoanPaymentRecord, LoanSchedulePeriod } from "@/v2/core/loans";
import {
  buildPaidByPeriod,
  buildPeriodOptions,
  resolveSuggestedPeriod,
} from "./RecordPaymentModal.periods";

const t = (_key: string, fallback: string) => fallback;

const schedule: LoanSchedulePeriod[] = [1, 2, 3].map((n) => ({
  periodNumber: n,
  dueDate: `2026-0${n}-01`,
  beginningBalance: 300_000_000,
  principalDue: 100_000_000,
  interestDue: 1_000_000,
  totalPaymentDue: 101_000_000,
  endingBalance: 200_000_000,
}));

const payment = (id: string, periodNumber: number): LoanPaymentRecord => ({
  id,
  loanId: "loan-1",
  periodNumber,
  paymentDate: "2026-01-05",
  principalPaid: 100_000_000,
  interestPaid: 1_000_000,
  totalPaid: 101_000_000,
  createdAt: "2026-01-05T00:00:00Z",
});

describe("buildPaidByPeriod", () => {
  it("lập bản đồ theo số kỳ", () => {
    const map = buildPaidByPeriod([payment("p1", 1), payment("p2", 2)]);
    expect(map.has(1)).toBe(true);
    expect(map.has(2)).toBe(true);
    expect(map.has(3)).toBe(false);
  });

  it("bỏ qua thanh toán đang sửa để kỳ của nó vẫn chọn được", () => {
    const map = buildPaidByPeriod([payment("p1", 1), payment("p2", 2)], "p1");
    expect(map.has(1)).toBe(false);
    expect(map.has(2)).toBe(true);
  });

  it("nhận undefined khi chưa có thanh toán", () => {
    expect(buildPaidByPeriod(undefined).size).toBe(0);
  });
});

describe("buildPeriodOptions", () => {
  it("kỳ đã trả bị disabled, có nhãn đã trả và tooltip chi tiết", () => {
    const options = buildPeriodOptions(
      schedule,
      buildPaidByPeriod([payment("p1", 1)]),
      t,
    );

    expect(options[0].disabled).toBe(true);
    expect(options[0].label).toContain("[Đã trả]");
    expect(options[0].tooltip).toContain("Gốc đã trả");
    expect(options[0].tooltip).toContain("Lãi đã trả");
    expect(options[0].tooltip).toContain("Tổng đã trả");
    expect(options[0].tooltip).toContain("2026-01-05");
  });

  it("kỳ chưa trả vẫn chọn được và không có tooltip", () => {
    const options = buildPeriodOptions(schedule, new Map(), t);
    expect(options.every((o) => !o.disabled)).toBe(true);
    expect(options.every((o) => o.tooltip === undefined)).toBe(true);
  });

  it("giữ value là số kỳ dạng chuỗi", () => {
    const options = buildPeriodOptions(schedule, new Map(), t);
    expect(options.map((o) => o.value)).toEqual(["1", "2", "3"]);
  });
});

describe("resolveSuggestedPeriod", () => {
  it("chọn kỳ chưa trả đầu tiên", () => {
    const paid = buildPaidByPeriod([payment("p1", 1)]);
    expect(resolveSuggestedPeriod(schedule, paid)).toBe(2);
  });

  it("trả null khi đã trả đủ mọi kỳ", () => {
    const paid = buildPaidByPeriod([
      payment("p1", 1),
      payment("p2", 2),
      payment("p3", 3),
    ]);
    expect(resolveSuggestedPeriod(schedule, paid)).toBeNull();
  });

  it("trả kỳ 1 khi chưa có thanh toán nào", () => {
    expect(resolveSuggestedPeriod(schedule, new Map())).toBe(1);
  });
});
