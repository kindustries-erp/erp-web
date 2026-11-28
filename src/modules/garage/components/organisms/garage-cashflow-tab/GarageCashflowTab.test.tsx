import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
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
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/garage-cashflow");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("syncs URL with appStore.updateCurrentTabUrl on mount and tab change, and responds to popstate", () => {
    vi.useFakeTimers();
    const updateSpy = vi.fn();
    useAppStore.setState({ updateCurrentTabUrl: updateSpy } as any);

    render(<GarageCashflowTab />);
    expect(window.location.search).toContain("tab=dashboard");
    expect(updateSpy).toHaveBeenCalledWith(
      "garage-cashflow",
      "/garage-cashflow?tab=dashboard",
    );

    fireEvent.click(screen.getByText("Switch to Forecast"));
    expect(window.location.search).toContain("tab=forecast");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(updateSpy).toHaveBeenCalledWith(
      "garage-cashflow",
      "/garage-cashflow?tab=forecast",
    );

    act(() => {
      window.history.replaceState(null, "", "/garage-cashflow?tab=vouchers");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(screen.getByTestId("mock-vouchers-view")).toBeInTheDocument();
  });
});
