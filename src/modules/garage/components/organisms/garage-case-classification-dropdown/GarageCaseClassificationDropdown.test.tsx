import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCaseClassificationDropdown } from "./GarageCaseClassificationDropdown";
import { garageApi } from "../../../api/garageApi";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";

vi.mock("@/core/api/moduleConfigApi", () => ({
  moduleConfigApi: {
    getCategories: vi.fn().mockResolvedValue([
      {
        id: "cat-1",
        code: "SUA_CHUA_CHUNG",
        name: "Sửa chữa chung",
        moduleKey: "GARAGE_CASE",
      },
      {
        id: "cat-2",
        code: "KY_GUI_NOI_BO",
        name: "Ký gửi / Nội bộ",
        moduleKey: "GARAGE_CASE",
      },
    ]),
  },
}));

vi.mock("../../../api/garageApi", () => ({
  garageApi: {
    updateCaseConfig: vi.fn().mockResolvedValue({
      id: "case-123",
      classification: "KY_GUI_NOI_BO",
      categoryId: "cat-2",
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

describe("GarageCaseClassificationDropdown", () => {
  const mockCaseItem = {
    id: "case-123",
    soChungTu: "GR-PDV-2026-0001",
    classification: "SUA_CHUA_CHUNG",
    categoryId: "cat-1",
    category: {
      id: "cat-1",
      code: "SUA_CHUA_CHUNG",
      name: "Sửa chữa chung",
    },
    excludeFromDebt: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger button with current classification badge", () => {
    render(
      <GarageCaseClassificationDropdown
        caseItem={mockCaseItem}
        canUpdate={true}
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Sửa chữa chung")).toBeDefined();
  });

  it("opens popover when clicking trigger button", async () => {
    render(
      <GarageCaseClassificationDropdown
        caseItem={mockCaseItem}
        canUpdate={true}
      />,
      { wrapper: createWrapper() },
    );

    const trigger = screen.getByTitle("Nhấn để đổi nhanh phân loại ERP");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Phân loại ERP")).toBeDefined();
      expect(screen.getByText("Ký gửi / Nội bộ")).toBeDefined();
      expect(screen.getByText("Chưa phân loại")).toBeDefined();
    });
  });

  it("calls updateCaseConfig when an option is selected", async () => {
    render(
      <GarageCaseClassificationDropdown
        caseItem={mockCaseItem}
        canUpdate={true}
      />,
      { wrapper: createWrapper() },
    );

    // Chờ categories query resolve
    await waitFor(() => {
      expect(moduleConfigApi.getCategories).toHaveBeenCalled();
    });

    const trigger = screen.getByTitle("Nhấn để đổi nhanh phân loại ERP");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Ký gửi / Nội bộ")).toBeDefined();
    });

    const optionBtn = screen.getByText("Ký gửi / Nội bộ").closest("button");
    if (optionBtn) {
      fireEvent.click(optionBtn);
    }

    await waitFor(() => {
      expect(garageApi.updateCaseConfig).toHaveBeenCalledWith("case-123", {
        categoryId: "cat-2",
        classification: "KY_GUI_NOI_BO",
        excludeFromDebt: false,
      });
    });
  });

  it("calls updateCaseConfig with null when unclassified is selected", async () => {
    render(
      <GarageCaseClassificationDropdown
        caseItem={mockCaseItem}
        canUpdate={true}
      />,
      { wrapper: createWrapper() },
    );

    const trigger = screen.getByTitle("Nhấn để đổi nhanh phân loại ERP");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Chưa phân loại")).toBeDefined();
    });

    const clearBtn = screen.getByText("Chưa phân loại").closest("button");
    if (clearBtn) {
      fireEvent.click(clearBtn);
    }

    await waitFor(() => {
      expect(garageApi.updateCaseConfig).toHaveBeenCalledWith("case-123", {
        categoryId: null,
        classification: null,
        excludeFromDebt: false,
      });
    });
  });

  it("calls onOpenDrawer when canUpdate is false", () => {
    const onOpenDrawer = vi.fn();
    render(
      <GarageCaseClassificationDropdown
        caseItem={mockCaseItem}
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
