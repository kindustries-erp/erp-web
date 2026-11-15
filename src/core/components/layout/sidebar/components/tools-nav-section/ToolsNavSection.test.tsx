import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  renderHook,
  act,
} from "@testing-library/react";
import { ToolsNavSection } from "./ToolsNavSection";
import { useToolsNavSection } from "./ToolsNavSection.hook";
import { useHasPermission } from "@/shared/hooks/useHasPermission";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => {
    const map: Record<string, string> = {
      "nav.sections.tools": "CÔNG CỤ",
      "nav.items.loans": "Khoản vay & Lãi suất",
    };
    return map[key] ?? fallback ?? key;
  },
}));

describe("useToolsNavSection hook", () => {
  const mockNavTo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHasPermission).mockReturnValue(true);
  });

  it("sets isLoansActive when currentPage is loans", () => {
    const { result } = renderHook(() =>
      useToolsNavSection({ currentPage: "loans", navTo: mockNavTo }),
    );
    expect(result.current.isLoansActive).toBe(true);
  });

  it("dispatches navTo('loans') on handleNavLoans", () => {
    const { result } = renderHook(() =>
      useToolsNavSection({ currentPage: "dashboard", navTo: mockNavTo }),
    );
    act(() => {
      result.current.handleNavLoans();
    });
    expect(mockNavTo).toHaveBeenCalledWith("loans");
  });
});

describe("ToolsNavSection Component", () => {
  const mockNavTo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHasPermission).mockReturnValue(true);
  });

  it("renders CÔNG CỤ section and Khoản vay & Lãi suất item", () => {
    render(
      <ToolsNavSection
        collapsed={false}
        currentPage="dashboard"
        navTo={mockNavTo}
      />,
    );
    expect(screen.getByText("CÔNG CỤ")).toBeInTheDocument();
    const item = screen.getByText("Khoản vay & Lãi suất");
    expect(item).toBeInTheDocument();

    fireEvent.click(item);
    expect(mockNavTo).toHaveBeenCalledWith("loans");
  });
});
