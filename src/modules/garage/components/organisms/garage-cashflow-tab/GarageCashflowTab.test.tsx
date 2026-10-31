import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GarageCashflowTab } from "./GarageCashflowTab";

vi.mock("../garage-cashflow-dashboard", () => ({
  GarageCashflowDashboard: ({ onTabChange, activeTab }: any) => (
    <div data-testid="mock-dashboard-view">
      <span>Dashboard View ({activeTab})</span>
      <button onClick={() => onTabChange("vouchers")}>
        Switch to Vouchers
      </button>
      <button onClick={() => onTabChange("forecast")}>
        Switch to Forecast
      </button>
    </div>
  ),
}));

vi.mock("../garage-cashflow-list", () => ({
  GarageCashflowList: ({ onTabChange, activeTab, tabKey }: any) => (
    <div data-testid={`mock-${tabKey || "vouchers"}-view`}>
      <span>
        {tabKey === "forecast" ? "Forecast" : "Vouchers"} View ({activeTab})
      </span>
      <button onClick={() => onTabChange("dashboard")}>
        Switch to Dashboard
      </button>
    </div>
  ),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback || key,
}));

describe("GarageCashflowTab", () => {
  it("renders dashboard tab by default", () => {
    render(<GarageCashflowTab initialTab="dashboard" />);
    expect(screen.getByTestId("mock-dashboard-view")).toBeInTheDocument();
  });

  it("renders forecast tab directly when initialTab is forecast", () => {
    render(<GarageCashflowTab initialTab="forecast" />);
    expect(screen.getByTestId("mock-forecast-view")).toBeInTheDocument();
  });

  it("switches tabs and keeps all views mounted", () => {
    render(<GarageCashflowTab initialTab="dashboard" />);
    expect(screen.getByTestId("mock-dashboard-view")).toBeInTheDocument();

    const toVouchersBtn = screen.getByText("Switch to Vouchers");
    fireEvent.click(toVouchersBtn);
    expect(screen.getByTestId("mock-vouchers-view")).toBeInTheDocument();

    const toForecastBtn = screen.getByText("Switch to Forecast");
    fireEvent.click(toForecastBtn);
    expect(screen.getByTestId("mock-forecast-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-vouchers-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-dashboard-view")).toBeInTheDocument();
  });
});
