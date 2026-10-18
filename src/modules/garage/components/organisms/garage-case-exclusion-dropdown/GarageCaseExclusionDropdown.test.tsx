import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCaseExclusionDropdown } from "./GarageCaseExclusionDropdown";
import { garageApi } from "../../../api/garageApi";

vi.mock("../../../api/garageApi", () => ({
  garageApi: {
    updateCaseConfig: vi.fn().mockResolvedValue({
      id: "case-123",
      excludeFromReports: true,
      excludeFromDebt: false,
    }),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("GarageCaseExclusionDropdown", () => {
  const mockCaseEmpty = {
    id: "case-123",
    soChungTu: "GR-PDV-2026-0001",
    excludeFromReports: false,
    excludeFromDebt: false,
  };

  const mockCaseWithReports = {
    id: "case-123",
    soChungTu: "GR-PDV-2026-0001",
    excludeFromReports: true,
    excludeFromDebt: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Quy tắc' dashed button when no exclusion flags are active", () => {
    render(
      <GarageCaseExclusionDropdown caseItem={mockCaseEmpty} canUpdate={true} />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Quy tắc")).toBeDefined();
  });

  it("renders exclusion badges when exclusion flags are active", () => {
    render(
      <GarageCaseExclusionDropdown
        caseItem={mockCaseWithReports}
        canUpdate={true}
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.queryByText("Quy tắc")).toBeNull();
  });

  it("opens popover with 2 multi-select options when clicking trigger", async () => {
    render(
      <GarageCaseExclusionDropdown caseItem={mockCaseEmpty} canUpdate={true} />,
      { wrapper: createWrapper() },
    );

    const trigger = screen.getByTitle(
      "Nhấn để thiết lập nhanh quy tắc loại trừ",
    );
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Quy tắc loại trừ")).toBeDefined();
      expect(screen.getByText("Không tính vào báo cáo")).toBeDefined();
      expect(screen.getByText("Không theo dõi công nợ")).toBeDefined();
    });
  });

  it("calls updateCaseConfig when toggling 'Không tính vào báo cáo'", async () => {
    render(
      <GarageCaseExclusionDropdown caseItem={mockCaseEmpty} canUpdate={true} />,
      { wrapper: createWrapper() },
    );

    const trigger = screen.getByTitle(
      "Nhấn để thiết lập nhanh quy tắc loại trừ",
    );
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Không tính vào báo cáo")).toBeDefined();
    });

    const optionBtn = screen
      .getByText("Không tính vào báo cáo")
      .closest('[role="button"]');
    if (optionBtn) {
      fireEvent.click(optionBtn);
    }

    await waitFor(() => {
      expect(garageApi.updateCaseConfig).toHaveBeenCalledWith("case-123", {
        excludeFromReports: true,
        excludeFromDebt: false,
      });
    });
  });

  it("calls onOpenDrawer when canUpdate is false", () => {
    const onOpenDrawer = vi.fn();
    render(
      <GarageCaseExclusionDropdown
        caseItem={mockCaseEmpty}
        canUpdate={false}
        onOpenDrawer={onOpenDrawer}
      />,
      { wrapper: createWrapper() },
    );

    const trigger = screen.getByTitle("Chỉ xem");
    fireEvent.click(trigger);

    expect(onOpenDrawer).toHaveBeenCalledTimes(1);
  });
});
