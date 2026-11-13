import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AmortizationMethod, LoanStatus } from "@/v2/core/loans";

const { listMock, removeMock, purgeMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
  removeMock: vi.fn(),
  purgeMock: vi.fn(),
}));

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
  useViewport: () => ({ isMobile: false }),
}));

vi.mock("@/v2/shared/components/organisms/v2-chart", () => ({
  V2ComboChart: () => <div data-testid="mock-combo-chart">Chart</div>,
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
      list: listMock,
      remove: removeMock,
      purge: purgeMock,
      options: vi.fn().mockResolvedValue({ items: [], total: 0, next: null }),
    },
  };
});

import { LoansListPage } from "./LoansListPage";

describe("LoansListPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/tools/loans");
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    listMock.mockResolvedValue({
      items: [
        {
          id: "loan-1",
          loanCode: "LOAN-001",
          title: "Vay mở rộng xưởng",
          lenderName: "VCB",
          principalAmount: 300_000_000,
          annualInterestRate: 9.5,
          tenorMonths: 24,
          amortizationMethod: AmortizationMethod.AMORTIZED,
          startDate: "2026-01-15",
          firstPaymentDate: "2026-02-15",
          totalPaidPrincipal: 50_000_000,
          totalPaidInterest: 10_000_000,
          remainingPrincipal: 250_000_000,
          status: LoanStatus.ACTIVE,
          createdAt: "2026-01-15T00:00:00Z",
          updatedAt: "2026-01-15T00:00:00Z",
        },
      ],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      summaries: {
        principalAmount: {
          total: 300_000_000,
          pageSubtotal: 300_000_000,
          cumulative: 300_000_000,
        },
        totalPaidPrincipal: {
          total: 50_000_000,
          pageSubtotal: 50_000_000,
          cumulative: 50_000_000,
        },
        remainingPrincipal: {
          total: 250_000_000,
          pageSubtotal: 250_000_000,
          cumulative: 250_000_000,
        },
      },
    });
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <LoansListPage />
      </QueryClientProvider>,
    );

  it("hiển thị đủ 3 tab với mặc định tab simulator và đồng bộ ?tab=list khi chuyển tab", async () => {
    const { container } = renderPage();

    const header = container.querySelector("header");
    expect(header).not.toHaveClass("bg-card", "rounded-2xl");
    expect(
      screen.getByRole("tab", { name: "Mô Phỏng & Tính Nhanh" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Dự Báo Dòng Tiền Tương Lai")).toBeDefined();
    const listTab = screen.getByText("Danh Sách Hợp Đồng");
    expect(listTab).toBeDefined();

    fireEvent.click(listTab);

    await waitFor(() => {
      expect(listMock).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          summaryKeys: expect.arrayContaining([
            "principalAmount",
            "totalPaidPrincipal",
            "remainingPrincipal",
          ]),
        }),
      );
    });

    expect(window.location.search).toContain("tab=list");
    expect(await screen.findByText("LOAN-001")).toBeDefined();
    expect(screen.getByText("Vay mở rộng xưởng")).toBeDefined();
  });

  it("tải thẳng tab list khi URL có ?tab=list", async () => {
    window.history.replaceState(null, "", "/tools/loans?tab=list");
    renderPage();

    expect(await screen.findByText("LOAN-001")).toBeDefined();
    expect(screen.getByText("Tổng cộng:")).toBeDefined();
  });

  it("hỗ trợ xóa mềm khoản vay qua V2ConfirmModal", async () => {
    window.history.replaceState(null, "", "/tools/loans?tab=list");
    removeMock.mockResolvedValueOnce(undefined);
    renderPage();

    expect(await screen.findByText("LOAN-001")).toBeDefined();

    const moreBtn = screen.getByRole("button", { name: "Thao tác khác" });
    fireEvent.click(moreBtn);
    const deleteItem = await screen.findByText("Xóa khoản vay");
    fireEvent.click(deleteItem);

    expect(
      await screen.findByText(/Khoản vay sẽ bị xóa mềm khỏi danh sách/i),
    ).toBeDefined();

    const confirmBtns = screen.getAllByRole("button", {
      name: "Xóa khoản vay",
    });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);

    await waitFor(() => {
      expect(removeMock).toHaveBeenCalledWith("loan-1");
    });
  });

  it("lọc Đã xóa mềm gửi deleted=only và cho phép xóa vĩnh viễn", async () => {
    window.history.replaceState(null, "", "/tools/loans?tab=list");
    purgeMock.mockResolvedValueOnce({ id: "loan-1" });
    renderPage();

    expect(await screen.findByText("LOAN-001")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Chế độ xem" }));
    fireEvent.click(await screen.findByText("Đã xóa mềm"));

    await waitFor(() => {
      expect(listMock).toHaveBeenCalledWith(
        expect.objectContaining({ deleted: "only" }),
      );
    });

    const purgeActionBtn = await screen.findByRole("button", {
      name: "Xóa vĩnh viễn",
    });
    fireEvent.click(purgeActionBtn);

    expect(
      await screen.findByText(/Khoản vay sẽ bị xóa khỏi hệ thống/i),
    ).toBeDefined();

    const confirmBtns = screen.getAllByRole("button", {
      name: "Xóa vĩnh viễn",
    });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);

    await waitFor(() => {
      expect(purgeMock).toHaveBeenCalledWith("loan-1");
    });
  });
});
