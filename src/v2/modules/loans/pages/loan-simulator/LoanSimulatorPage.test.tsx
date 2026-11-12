import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoanSimulatorPage } from "./LoanSimulatorPage";

const mockViewport = vi.fn(() => ({ isMobile: false }));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: (selector?: (s: { accessToken: string | null }) => unknown) =>
    selector ? selector({ accessToken: null }) : { accessToken: null },
}));

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    locale: "vi",
    t: (_k: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : _k,
  }),
}));

vi.mock("@/v2/shared/hooks/useViewport", () => ({
  useViewport: () => mockViewport(),
}));

vi.mock("@/v2/shared/components/organisms/v2-chart", () => ({
  V2ComboChart: () => <div data-testid="mock-combo-chart">Chart</div>,
}));

describe("LoanSimulatorPage Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockViewport.mockReturnValue({ isMobile: false });
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

  it("renders consolidated header actions without outer portfolio wrapper on desktop", () => {
    renderWithProviders(<LoanSimulatorPage />);

    expect(
      screen.getByText("Mô Phỏng & Tính Toán Khoản Vay Đa Nguồn"),
    ).toBeDefined();
    expect(screen.queryByText("Danh Mục Khoản Vay")).toBeNull();
    expect(screen.getAllByText("Mặc định")).toHaveLength(1);
    expect(screen.getAllByText("Thêm khoản vay")).toHaveLength(1);
    expect(screen.getByText(/khoản đang bật/)).toBeDefined();
    expect(screen.getByText("Số tiền vay (VND)")).toBeDefined();
    expect(screen.getByText("Lãi suất (%/năm)")).toBeDefined();
    expect(screen.getByText("Thời hạn (Số tháng)")).toBeDefined();
    expect(screen.getByText("Phương thức trả nợ")).toBeDefined();
    expect(screen.getByText("Ngày giải ngân")).toBeDefined();
    expect(screen.getByText("Ngân hàng / Đơn vị cho vay")).toBeDefined();
    expect(screen.getByText("Lịch Trả Nợ Danh Mục Theo Tháng")).toBeDefined();
  });

  it("adds a new loan to portfolio on add click and resets via top reset button", () => {
    renderWithProviders(<LoanSimulatorPage />);

    fireEvent.click(screen.getByText("Thêm khoản vay"));
    expect(screen.getByDisplayValue("Khoản vay 2")).toBeDefined();

    fireEvent.click(screen.getByText("Mặc định"));
    expect(screen.queryByDisplayValue("Khoản vay 2")).toBeNull();
    expect(screen.getByDisplayValue("Khoản vay 1 (Dự án)")).toBeDefined();
  });

  it("expands monthly row to show constituent loan breakdown columns", () => {
    renderWithProviders(<LoanSimulatorPage />);

    const expandButtons = screen.getAllByRole("button", {
      name: /Mở rộng dòng/i,
    });
    expect(expandButtons.length).toBeGreaterThan(0);
    fireEvent.click(expandButtons[0]);

    expect(screen.getByText("Khoản vay 1 (Dự án)")).toBeDefined();
  });

  it("saves portfolio draft to sessionStorage when unauthenticated", () => {
    renderWithProviders(<LoanSimulatorPage />);

    fireEvent.click(screen.getByText("Đăng nhập để lưu vào ERP"));

    const savedDraft = sessionStorage.getItem(
      "loan_draft_simulation_portfolio",
    );
    expect(savedDraft).not.toBeNull();
    const parsed = JSON.parse(savedDraft!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it("hides header card on mobile and exposes Save, Add, Reset inside V2BottomSheet", () => {
    mockViewport.mockReturnValue({ isMobile: true });
    renderWithProviders(<LoanSimulatorPage />);

    expect(
      screen.queryByText("Mô Phỏng & Tính Toán Khoản Vay Đa Nguồn"),
    ).toBeNull();
    expect(screen.queryByText("Đăng nhập để lưu vào ERP")).toBeNull();

    fireEvent.click(
      screen.getByTestId("loan-simulator-mobile-actions-trigger"),
    );

    expect(screen.getByText("Thao tác mô phỏng")).toBeDefined();
    expect(screen.getByText("Đăng nhập để lưu vào ERP")).toBeDefined();
    expect(screen.getByText("Thêm khoản vay")).toBeDefined();
    expect(screen.getByText("Mặc định")).toBeDefined();

    fireEvent.click(screen.getByText("Thêm khoản vay"));
    expect(screen.getByDisplayValue("Khoản vay 2")).toBeDefined();
  });
});
