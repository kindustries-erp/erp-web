import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCashflowTrendPanel } from "./GarageCashflowTrendPanel";

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

describe("GarageCashflowTrendPanel", () => {
  it("renders loading skeleton when loading is true", () => {
    const { container } = render(
      <GarageCashflowTrendPanel trend={[]} loading={true} />,
    );
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders empty state when trend is empty and not loading", () => {
    render(<GarageCashflowTrendPanel trend={[]} loading={false} />);
    expect(screen.getByText("Chưa có dữ liệu")).toBeInTheDocument();
  });

  it("renders bar chart and legend when data exists", () => {
    const trendData = [
      { label: "01/2026", cashIn: 1000000, cashOut: 500000, net: 500000 },
      { label: "02/2026", cashIn: 2000000, cashOut: 800000, net: 1200000 },
    ];
    render(<GarageCashflowTrendPanel trend={trendData} loading={false} />);
    expect(screen.getByTestId("mock-bar-chart")).toBeInTheDocument();
    expect(screen.getByText("01/2026")).toBeInTheDocument();
    expect(screen.getByText("02/2026")).toBeInTheDocument();
  });
});
