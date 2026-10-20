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
    </div>
  ),
}));

vi.mock("../garage-cashflow-list", () => ({
  GarageCashflowList: ({ onTabChange, activeTab }: any) => (
    <div data-testid="mock-vouchers-view">
      <span>Vouchers View ({activeTab})</span>
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

  it("switches tabs and keeps both views mounted", () => {
    render(<GarageCashflowTab initialTab="dashboard" />);
    const switchBtn = screen.getByText("Switch to Vouchers");
    fireEvent.click(switchBtn);

    expect(screen.getByTestId("mock-vouchers-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-dashboard-view")).toBeInTheDocument();
  });
});
