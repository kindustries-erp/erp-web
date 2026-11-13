import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: (
    selector?: (s: { effectivePermissions: unknown[] }) => unknown,
  ) => {
    const state = {
      effectivePermissions: [
        {
          collection: "loans",
          actions: ["read", "create", "update", "delete", "purge"],
        },
      ],
      accessToken: "token",
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/v2/shared/hooks/useViewport", () => ({
  useViewport: () => ({
    width: 390,
    height: 844,
    isMobile: true,
    isTablet: false,
    isDesktop: false,
  }),
}));

vi.mock("../loan-simulator", () => ({
  LoanSimulatorPage: () => <div data-testid="mock-simulator">Simulator</div>,
}));

vi.mock("../../components/organisms/consolidated-cashflow", () => ({
  ConsolidatedCashflowView: () => (
    <div data-testid="mock-projection">Projection</div>
  ),
}));

vi.mock("../../api/loansApi", async () => {
  const actual =
    await vi.importActual<typeof import("../../api/loansApi")>(
      "../../api/loansApi",
    );
  return {
    ...actual,
    loansApi: {
      ...actual.loansApi,
      list: vi.fn().mockResolvedValue({
        items: [],
        pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
        summaries: {},
      }),
      options: vi.fn().mockResolvedValue({ items: [], total: 0, next: null }),
    },
  };
});

import { LoansListPage } from "./LoansListPage";

describe("LoansListPage Mobile", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it("giữ Header thu gọn (ẩn description trên mobile) kèm nút + Thêm khoản vay mới và mở V2BottomSheet chọn tab", () => {
    const { container } = renderPage();

    const header = container.querySelector("header");
    expect(header).toHaveClass("flex", "justify-between");
    expect(screen.getByText("Quản Lý Khoản Vay & Dòng Tiền")).toBeDefined();
    expect(
      screen.getByText(
        "Theo dõi nghĩa vụ nợ, lập kế hoạch dòng tiền và mô phỏng tài chính.",
      ),
    ).toHaveClass("hidden", "sm:block");
    expect(
      screen.getByRole("button", { name: "Thêm khoản vay mới" }),
    ).toBeDefined();

    fireEvent.click(screen.getByTestId("v2-tab-bar-mobile-trigger"));
    expect(screen.getByText("Chuyển danh mục")).toBeDefined();

    fireEvent.click(screen.getByText("Dự Báo Dòng Tiền Tương Lai"));
    expect(screen.getByTestId("mock-projection")).toBeDefined();
    expect(window.location.search).toContain("tab=projection");
  });

  it("hiển thị V2StandardTableMobile ở tab Danh Sách Hợp Đồng trên mobile", async () => {
    window.history.replaceState(null, "", "/tools/loans?tab=list");
    renderPage();

    expect(
      await screen.findByTestId("v2-table-mobile-search-filter-btn"),
    ).toBeDefined();
  });
});
