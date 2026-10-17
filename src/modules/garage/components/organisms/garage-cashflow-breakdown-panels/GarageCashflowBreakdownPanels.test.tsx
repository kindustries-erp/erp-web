import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCashflowBreakdownPanels } from "./GarageCashflowBreakdownPanels";

vi.mock("@/shared/components/charts/BarChart", () => ({
  BarChart: ({ labels }: { labels: string[] }) => (
    <div data-testid="mock-bar-chart">
      {labels.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  ),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback || key,
}));

describe("GarageCashflowBreakdownPanels", () => {
  it("renders loading skeleton when loading is true", () => {
    const { container } = render(
      <GarageCashflowBreakdownPanels loading={true} />,
    );
    expect(
      container.querySelectorAll(".animate-pulse").length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("renders empty state when both breakdowns are empty", () => {
    render(
      <GarageCashflowBreakdownPanels
        methodBreakdown={{ in: [], out: [] }}
        contentBreakdown={{ in: [], out: [] }}
        loading={false}
      />,
    );
    expect(screen.getAllByText("Chưa có dữ liệu").length).toBe(2);
  });

  it("renders bar charts when data is provided", () => {
    const methodData = {
      in: [{ name: "TIEN_MAT", amount: 5000000, count: 5 }],
      out: [{ name: "CHUYEN_KHOAN", amount: 4000000, count: 2 }],
    };
    const contentData = {
      in: [{ name: "TIEN_DICH_VU", amount: 18000000, count: 14 }],
      out: [{ name: "MUA_PHU_TUNG", amount: 5000000, count: 3 }],
    };

    render(
      <GarageCashflowBreakdownPanels
        methodBreakdown={methodData}
        contentBreakdown={contentData}
        loading={false}
      />,
    );

    expect(screen.getAllByTestId("mock-bar-chart").length).toBe(2);
    expect(screen.getByText("TIEN_MAT")).toBeInTheDocument();
    expect(screen.getByText("CHUYEN_KHOAN")).toBeInTheDocument();
    expect(screen.getByText("TIEN_DICH_VU")).toBeInTheDocument();
    expect(screen.getByText("MUA_PHU_TUNG")).toBeInTheDocument();
  });
});
