import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GarageCasesTableTitleExtra } from "./GarageCasesTableTab.titleExtra";

const t = (_k: string, fb: string, o?: Record<string, unknown>) =>
  fb.replace(/\{\{(\w+)\}\}/g, (_m, k) => String(o?.[k] ?? ""));

const base = {
  showProfitMetrics: true,
  rowCount: 3,
  caseCount: 5,
  loadedVehicles: 3,
  totalBilled: 0,
  totalRemaining: 0,
  t,
};

describe("GarageCasesTableTitleExtra", () => {
  it("hiện số xe và số lệnh, không báo cắt khi đã tải đủ", () => {
    render(<GarageCasesTableTitleExtra {...base} vehicleTotal={3} />);
    expect(screen.getByTestId("cases-table-counts").textContent).toBe(
      "3 xe · 5 lệnh",
    );
    expect(screen.queryByTestId("cases-table-truncated")).toBeNull();
  });

  it("báo cắt khi tổng xe của API lớn hơn số đã tải", () => {
    render(<GarageCasesTableTitleExtra {...base} vehicleTotal={620} />);
    expect(screen.getByTestId("cases-table-truncated").textContent).toBe(
      "Hiển thị 3/620 xe",
    );
  });

  it("chế độ công nợ đếm theo phiếu, không báo cắt", () => {
    render(
      <GarageCasesTableTitleExtra
        {...base}
        showProfitMetrics={false}
        vehicleTotal={620}
      />,
    );
    expect(screen.getByTestId("cases-table-counts").textContent).toBe(
      "5 phiếu",
    );
    expect(screen.queryByTestId("cases-table-truncated")).toBeNull();
  });
});
