import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { GarageNavSection } from "./GarageNavSection";
import { useGarageNavSection } from "./GarageNavSection.hook";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource } from "@/modules/system/types/rbac";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => {
    const map: Record<string, string> = {
      "nav.sections.garage": "GARAGE",
      "nav.items.garageCashflow": "Thu chi garage",
      "nav.items.garageCases": "Hoạt động garage",
      "nav.items.garageDebts": "Công nợ garage",
      "nav.items.garageOpex": "Chi phí vận hành Garage",
    };
    return map[key] ?? fallback ?? key;
  },
}));

describe("useGarageNavSection hook", () => {
  const mockNavTo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns independent cashflow, cases, debts, and opex permissions", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);
    const { result } = renderHook(() =>
      useGarageNavSection({ currentPage: "garage-cashflow", navTo: mockNavTo }),
    );
    expect(result.current.canReadGarageCashflow).toBe(true);
    expect(result.current.canReadGarageCases).toBe(true);
    expect(result.current.canReadGarageDebts).toBe(true);
    expect(result.current.canReadGarageOpex).toBe(true);
    expect(result.current.isCashflowActive).toBe(true);
    expect(result.current.isCasesActive).toBe(false);
    expect(result.current.isDebtsActive).toBe(false);
    expect(result.current.isOpexActive).toBe(false);
  });

  it("handles active states for debts and partners sub-pages", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);
    const { result } = renderHook(() =>
      useGarageNavSection({ currentPage: "garage-partners", navTo: mockNavTo }),
    );
    expect(result.current.isCasesActive).toBe(false);
    expect(result.current.isDebtsActive).toBe(true);
  });

  it("calls navTo on navigation handlers", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);
    const { result } = renderHook(() =>
      useGarageNavSection({ currentPage: "dashboard", navTo: mockNavTo }),
    );

    act(() => {
      result.current.handleNavCases();
    });
    expect(mockNavTo).toHaveBeenCalledWith("garage-cases");

    act(() => {
      result.current.handleNavDebts();
    });
    expect(mockNavTo).toHaveBeenCalledWith("garage-debts");

    act(() => {
      result.current.handleNavOpex();
    });
    expect(mockNavTo).toHaveBeenCalledWith("garage-opex");
  });
});

describe("GarageNavSection component", () => {
  const mockNavTo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders null when user lacks GARAGE permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      if (resource === ErpResource.GARAGE) return false;
      return false;
    });

    const { container } = render(
      <GarageNavSection
        collapsed={false}
        currentPage="garage-cases"
        navTo={mockNavTo}
      />,
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText("GARAGE")).toBeNull();
    expect(screen.queryByText("Thu chi garage")).toBeNull();
    expect(screen.queryByText("Hoạt động garage")).toBeNull();
    expect(screen.queryByText("Công nợ garage")).toBeNull();
    expect(screen.queryByText("Chi phí vận hành Garage")).toBeNull();
  });

  it("renders only cashflow when user has only GARAGE_CASHFLOW permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.GARAGE_CASHFLOW;
    });

    render(
      <GarageNavSection
        collapsed={false}
        currentPage="garage-cashflow"
        navTo={mockNavTo}
      />,
    );

    expect(screen.getByText("GARAGE")).toBeInTheDocument();
    expect(screen.getByText("Thu chi garage")).toBeInTheDocument();
    expect(screen.queryByText("Hoạt động garage")).toBeNull();
    expect(screen.queryByText("Công nợ garage")).toBeNull();
    expect(screen.queryByText("Chi phí vận hành Garage")).toBeNull();

    fireEvent.click(screen.getByText("Thu chi garage"));
    expect(mockNavTo).toHaveBeenCalledWith("garage-cashflow");
  });

  it("renders only debts when user has GARAGE_DEBTS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.GARAGE_DEBTS;
    });

    render(
      <GarageNavSection
        collapsed={false}
        currentPage="garage-debts"
        navTo={mockNavTo}
      />,
    );

    expect(screen.getByText("GARAGE")).toBeInTheDocument();
    expect(screen.queryByText("Thu chi garage")).toBeNull();
    expect(screen.queryByText("Hoạt động garage")).toBeNull();
    expect(screen.getByText("Công nợ garage")).toBeInTheDocument();
    expect(screen.queryByText("Chi phí vận hành Garage")).toBeNull();
  });

  it("renders 4 flat nav items with Thu chi garage positioned above Hoạt động garage", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return (
        resource === ErpResource.GARAGE ||
        resource === ErpResource.GARAGE_DEBTS ||
        resource === ErpResource.GARAGE_CASHFLOW
      );
    });

    const { container } = render(
      <GarageNavSection
        collapsed={false}
        currentPage="garage-cashflow"
        navTo={mockNavTo}
      />,
    );

    expect(screen.getByText("GARAGE")).toBeInTheDocument();
    expect(screen.getByText("Thu chi garage")).toBeInTheDocument();
    expect(screen.getByText("Hoạt động garage")).toBeInTheDocument();
    expect(screen.getByText("Công nợ garage")).toBeInTheDocument();
    expect(screen.getByText("Chi phí vận hành Garage")).toBeInTheDocument();

    // Verify order in DOM: Thu chi garage is before Hoạt động garage
    const items = container.querySelectorAll(".nav-label");
    const labels = Array.from(items).map((el) => el.textContent?.trim());
    expect(labels).toEqual([
      "Thu chi garage",
      "Hoạt động garage",
      "Công nợ garage",
      "Chi phí vận hành Garage",
    ]);

    // Verify click triggers navigation
    fireEvent.click(screen.getByText("Thu chi garage"));
    expect(mockNavTo).toHaveBeenCalledWith("garage-cashflow");
  });
});
