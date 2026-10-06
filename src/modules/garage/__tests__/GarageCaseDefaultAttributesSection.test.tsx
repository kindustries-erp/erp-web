import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCaseDefaultAttributesSection } from "../components/drawer/sections/GarageCaseDefaultAttributesSection";

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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("GarageCaseDefaultAttributesSection", () => {
  const mockCaseData = {
    id: "case-123",
    soChungTu: "GR-PDV-2026-0001",
    classification: "SUA_CHUA_CHUNG",
    category: {
      id: "cat-1",
      code: "SUA_CHUA_CHUNG",
      name: "Sửa chữa chung",
    },
    excludeFromReports: true,
    excludeFromDebt: false,
  };

  it("renders in view mode with category badge and exclusion badge", () => {
    const onStartEdit = vi.fn();

    render(
      <GarageCaseDefaultAttributesSection
        caseData={mockCaseData}
        editMode={false}
        categoryId="cat-1"
        onCategoryChange={vi.fn()}
        excludeFromReports={true}
        onExcludeFromReportsChange={vi.fn()}
        excludeFromDebt={false}
        onExcludeFromDebtChange={vi.fn()}
        onStartEdit={onStartEdit}
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Sửa chữa chung")).toBeDefined();
    expect(screen.getByText("Không báo cáo")).toBeDefined();

    // Click category badge triggers start edit
    const badgeBtn = screen.getByTitle("Nhấn để chỉnh sửa phân loại");
    fireEvent.click(badgeBtn);
    expect(onStartEdit).toHaveBeenCalledTimes(1);
  });

  it("renders in edit mode with category Combobox and 2 exclusion checkboxes", () => {
    const onReportsChange = vi.fn();
    const onDebtChange = vi.fn();

    render(
      <GarageCaseDefaultAttributesSection
        caseData={mockCaseData}
        editMode={true}
        categoryId="cat-1"
        onCategoryChange={vi.fn()}
        excludeFromReports={true}
        onExcludeFromReportsChange={onReportsChange}
        excludeFromDebt={false}
        onExcludeFromDebtChange={onDebtChange}
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Không tính vào báo cáo")).toBeDefined();
    expect(
      screen.getByText("Không tính công nợ doanh thu / chi phí"),
    ).toBeDefined();

    const reportCheckbox = screen.getByRole("checkbox", {
      name: /Không tính vào báo cáo/i,
    });
    expect(reportCheckbox).toBeDefined();

    const debtCheckbox = screen.getByRole("checkbox", {
      name: /Không tính công nợ doanh thu \/ chi phí/i,
    });
    expect(debtCheckbox).toBeDefined();
  });
});
