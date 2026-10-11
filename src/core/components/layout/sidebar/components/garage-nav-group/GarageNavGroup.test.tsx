import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import React from "react";
import { GarageNavGroup } from "./GarageNavGroup";
import { useGarageNavGroup } from "./GarageNavGroup.hook";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => {
    if (key === "nav.items.garageServicesGroup") return "Dịch vụ Garage";
    if (key === "nav.items.garageCases") return "Phiếu dịch vụ";
    if (key === "nav.items.garageDebts") return "Công nợ garage";
    return fallback || key;
  },
}));

vi.mock("@/shared/hooks/useIsMobile", () => ({
  useIsMobile: () => true,
}));

describe("useGarageNavGroup hook", () => {
  it("determines shouldShowGroup correctly based on permissions", () => {
    const navTo = vi.fn();
    const testPerms = (canReadGarage: boolean) =>
      renderHook(() =>
        useGarageNavGroup({
          currentPage: "dashboard",
          navTo,
          canReadGarage,
        }),
      ).result.current.shouldShowGroup;

    expect(testPerms(false)).toBe(false);
    expect(testPerms(true)).toBe(true);
  });

  it("calculates active states for garage cases and debt routes", () => {
    const navTo = vi.fn();
    const caseRoutes = ["garage-cases", "garage-dashboard"];

    for (const route of caseRoutes) {
      const { result } = renderHook(() =>
        useGarageNavGroup({
          currentPage: route,
          navTo,
          canReadGarage: true,
        }),
      );
      expect(result.current.isCasesActive).toBe(true);
      expect(result.current.isDebtsActive).toBe(false);
      expect(result.current.isGroupActive).toBe(true);
    }

    const debtRoutes = ["garage-debts", "garage-partners", "garage-customers"];

    for (const route of debtRoutes) {
      const { result } = renderHook(() =>
        useGarageNavGroup({
          currentPage: route,
          navTo,
          canReadGarage: true,
        }),
      );
      expect(result.current.isCasesActive).toBe(false);
      expect(result.current.isDebtsActive).toBe(true);
      expect(result.current.isGroupActive).toBe(true);
    }

    const { result: neutralResult } = renderHook(() =>
      useGarageNavGroup({
        currentPage: "dashboard",
        navTo,
        canReadGarage: true,
      }),
    );
    expect(neutralResult.current.isCasesActive).toBe(false);
    expect(neutralResult.current.isDebtsActive).toBe(false);
    expect(neutralResult.current.isGroupActive).toBe(false);
  });

  it("navigates correctly on handler invocation", () => {
    const navTo = vi.fn();
    const { result } = renderHook(() =>
      useGarageNavGroup({
        currentPage: "dashboard",
        navTo,
        canReadGarage: true,
      }),
    );

    result.current.handleNavCases();
    expect(navTo).toHaveBeenCalledWith("garage-cases");
    result.current.handleNavDebts();
    expect(navTo).toHaveBeenCalledWith("garage-debts");
  });
});

describe("GarageNavGroup component", () => {
  it("renders nothing when user has no permissions", () => {
    const { container } = render(
      <GarageNavGroup
        collapsed={false}
        currentPage="dashboard"
        navTo={vi.fn()}
        canReadGarage={false}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders group and items when user has permissions", () => {
    const navTo = vi.fn();
    render(
      <GarageNavGroup
        collapsed={false}
        currentPage="dashboard"
        navTo={navTo}
        canReadGarage={true}
      />,
    );

    expect(screen.getByText("Dịch vụ Garage")).toBeInTheDocument();
    expect(screen.getByText("Phiếu dịch vụ")).toBeInTheDocument();
    expect(screen.getByText("Công nợ garage")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Phiếu dịch vụ"));
    expect(navTo).toHaveBeenCalledWith("garage-cases");

    fireEvent.click(screen.getByText("Công nợ garage"));
    expect(navTo).toHaveBeenCalledWith("garage-debts");
  });
});
