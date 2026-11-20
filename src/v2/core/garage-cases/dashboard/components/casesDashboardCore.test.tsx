import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CasesDashboardKpiCard } from "./CasesDashboardKpiCard";
import { CasesDashboardFunnel } from "./CasesDashboardFunnel";
import { CasesDashboardClassificationTable } from "./CasesDashboardClassificationTable";
import { formatNumber } from "@/v2/shared/utils/v2TableFormat";

describe("lõi dashboard garage: thẻ KPI", () => {
  it("hiển thị số xe và số lệnh tách bạch (không gộp thành một số)", () => {
    render(
      <CasesDashboardKpiCard
        title="Tháng này"
        counts={{ vehicles: 4, cases: 6, amount: 1000 }}
        testId="kpi-month"
      />,
    );

    const counts = screen.getByTestId("kpi-month-counts").textContent ?? "";
    expect(counts).toContain(formatNumber(4));
    expect(counts).toContain(formatNumber(6));
    expect(screen.getByText("Tháng này")).toBeTruthy();
  });
});

describe("lõi dashboard garage: phễu", () => {
  const rows = [
    { key: "quotation" as const, vehicles: 2, amount: 200, rate: 50 },
    { key: "completed" as const, vehicles: 3, amount: 300, rate: 75 },
  ];

  it("render một dòng cho mỗi giai đoạn", () => {
    render(<CasesDashboardFunnel rows={rows} />);

    expect(screen.getByTestId("funnel-row-quotation")).toBeTruthy();
    expect(screen.getByTestId("funnel-row-completed")).toBeTruthy();
  });

  it("không có onStageClick thì không có nút bấm", () => {
    render(<CasesDashboardFunnel rows={rows} />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("có onStageClick thì bấm giai đoạn trả về đúng khóa", () => {
    const onStageClick = vi.fn();
    render(<CasesDashboardFunnel rows={rows} onStageClick={onStageClick} />);

    const row = screen.getByTestId("funnel-row-completed");
    fireEvent.click(row.querySelector("button") as HTMLButtonElement);

    expect(onStageClick).toHaveBeenCalledWith("completed");
  });
});

describe("lõi dashboard garage: bảng phân loại", () => {
  it("render dòng theo phân loại với xe, lệnh và tiền", () => {
    render(
      <CasesDashboardClassificationTable
        rows={[
          { key: "SUA_CHUA_CHUNG", vehicles: 1234, cases: 7, amount: 500 },
          { key: "KHAC", vehicles: 0, cases: 0, amount: 0 },
        ]}
      />,
    );

    const table = screen.getByTestId("cases-dashboard-classification");
    expect(table.textContent).toContain(formatNumber(1234));
    expect(table.querySelectorAll("tbody tr")).toHaveLength(2);
  });
});
