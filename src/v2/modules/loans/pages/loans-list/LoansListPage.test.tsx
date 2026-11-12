import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoansListPage } from "./LoansListPage";

const mockViewport = vi.fn(() => ({ isMobile: true }));

vi.mock("@/v2/shared/hooks/useViewport", () => ({
  useViewport: () => mockViewport(),
}));

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    locale: "vi",
    t: (_k: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : _k,
  }),
}));

vi.mock("../../api", async () => {
  const actual = await vi.importActual<typeof import("../../api")>("../../api");
  return {
    ...actual,
    useLoansListQuery: () => ({
      data: { items: [], total: 2 },
      isLoading: false,
    }),
  };
});

vi.mock("../loan-simulator", () => ({
  LoanSimulatorPage: () => <div data-testid="mock-simulator">Simulator</div>,
}));

vi.mock("../../components/organisms/consolidated-cashflow", () => ({
  ConsolidatedCashflowView: () => (
    <div data-testid="mock-projection">Projection</div>
  ),
}));

describe("LoansListPage Mobile", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockViewport.mockReturnValue({ isMobile: true });
    window.history.replaceState(null, "", "/tools/loans");
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <LoansListPage />
      </QueryClientProvider>,
    );

  it("hides header card and Thêm button on mobile and renders V2TabBar trigger", () => {
    renderPage();

    expect(screen.queryByText("Quản Lý Khoản Vay")).toBeNull();
    expect(screen.queryByText("Thêm")).toBeNull();
    expect(screen.getByTestId("v2-tab-bar-mobile-trigger")).toBeDefined();
    expect(screen.getByTestId("mock-simulator")).toBeDefined();
  });

  it("opens V2BottomSheet tab picker and switches to projection tab on mobile", () => {
    renderPage();

    fireEvent.click(screen.getByTestId("v2-tab-bar-mobile-trigger"));

    expect(screen.getByText("Chuyển danh mục")).toBeDefined();
    fireEvent.click(screen.getByText("Dự Báo Dòng Tiền Tương Lai"));

    expect(screen.getByTestId("mock-projection")).toBeDefined();
    expect(window.location.search).toContain("tab=projection");
  });
});
