import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoanSimulatorPage } from "./LoanSimulatorPage";

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: (selector?: (s: { accessToken: string | null }) => unknown) =>
    selector ? selector({ accessToken: null }) : { accessToken: null },
}));

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    locale: "vi",
    t: (_k: string, fallback?: string) => fallback || _k,
  }),
}));

vi.mock("@/v2/shared/hooks/useViewport", () => ({
  useViewport: () => ({ isMobile: false }),
}));

vi.mock("@/v2/shared/components/organisms/v2-chart", () => ({
  V2ComboChart: () => <div data-testid="mock-combo-chart">Chart</div>,
}));

describe("LoanSimulatorPage Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );
  };

  it("renders portfolio simulator heading and default loan item", () => {
    renderWithProviders(<LoanSimulatorPage />);

    expect(
      screen.getByText("Mô Phỏng & Tính Toán Khoản Vay Đa Nguồn"),
    ).toBeDefined();
    expect(screen.getByText("Danh Mục Khoản Vay")).toBeDefined();
    expect(screen.getByText("Lịch Trả Nợ Danh Mục Theo Tháng")).toBeDefined();
  });

  it("adds a new loan to portfolio on add click", () => {
    renderWithProviders(<LoanSimulatorPage />);

    const addButton = screen.getByText("Thêm khoản vay");
    fireEvent.click(addButton);

    expect(screen.getByDisplayValue("Khoản vay 2")).toBeDefined();
  });

  it("expands monthly row to show constituent loan breakdown columns", () => {
    renderWithProviders(<LoanSimulatorPage />);

    // Click row đầu tiên trong bảng (theo tbody)
    const rows = document.querySelectorAll("tbody tr");
    expect(rows.length).toBeGreaterThan(0);
    fireEvent.click(rows[0]);

    // Sau khi expand, tên khoản vay mặc định xuất hiện trong dòng chi tiết
    expect(screen.getByText("Khoản vay 1 (Dự án)")).toBeDefined();
  });

  it("saves portfolio draft to sessionStorage when unauthenticated", () => {
    renderWithProviders(<LoanSimulatorPage />);

    const saveButton = screen.getByText("Đăng nhập để lưu vào ERP");
    fireEvent.click(saveButton);

    const savedDraft = sessionStorage.getItem(
      "loan_draft_simulation_portfolio",
    );
    expect(savedDraft).not.toBeNull();
    const parsed = JSON.parse(savedDraft!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });
});
