import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  getOverdueDays,
  getOverdueOptions,
  renderOverdueCell,
} from "./GarageCashflowTable.overdueColumn";
import { getGarageCashflowColumns } from "./GarageCashflowTable.columns";

const tr = (_key: string, def?: string) => def || "";
// 18:00 UTC ngày 27 đã là ngày 28 giờ Việt Nam.
const NOW = new Date("2026-11-27T18:00:00Z");

const keysOf = (tabKey: "vouchers" | "forecast") => {
  const filterBuilder = vi.fn((key) => key) as any;
  filterBuilder.date = vi.fn(() => "date");
  filterBuilder.amount = vi.fn(() => "amount");
  return getGarageCashflowColumns(
    filterBuilder,
    vi.fn(),
    vi.fn(),
    undefined,
    tabKey,
  ).map((c) => c.key);
};

describe("cột quá hạn của phiếu dự thu chi", () => {
  it.each([
    ["2026-11-28", 0],
    ["2026-11-27", 1],
    ["2026-10-29", 30],
    ["2026-10-28", 31],
    ["2026-08-29", 91],
    ["2026-12-03", -5],
  ])("ngày dự kiến %s quá hạn %i ngày theo giờ VN", (date, days) => {
    expect(getOverdueDays(date, NOW)).toBe(days);
  });

  it("thiếu ngày thì không tính", () => {
    expect(getOverdueDays(null, NOW)).toBeNull();
  });

  it("gửi đúng giá trị nhóm của API", () => {
    expect(getOverdueOptions(tr).map((o) => o.value)).toEqual([
      "NOT_DUE",
      "D1_30",
      "D31_90",
      "D90_PLUS",
    ]);
  });

  it("phiếu chưa tới ngày hiện Chưa đến hạn", () => {
    render(<>{renderOverdueCell({ transDate: "2999-01-01" } as any, tr)}</>);
    expect(screen.getByText("Chưa đến hạn")).toBeTruthy();
  });

  it("chỉ có ở tab dự thu chi, ngay sau ngày dự kiến", () => {
    const forecast = keysOf("forecast");
    expect(forecast[forecast.indexOf("transDate") + 1]).toBe("overdueDays");
    expect(keysOf("vouchers")).not.toContain("overdueDays");
  });
});
