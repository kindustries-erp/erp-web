import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCashflowExportDrawer } from "./GarageCashflowExportDrawer";
import { garageCashflowApi } from "@/modules/garage/api/garageCashflowApi";

vi.mock("@/modules/garage/api/garageCashflowApi", () => ({
  garageCashflowApi: {
    listExportExcelHistory: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    startExportExcelBackground: vi.fn().mockResolvedValue({
      jobId: "job-123",
      message: "Khởi tạo thành công",
    }),
    downloadExportExcelFile: vi.fn().mockResolvedValue(new Blob()),
  },
}));

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getBankAccounts: vi.fn().mockResolvedValue([
      {
        id: "acc-1",
        bankCode: "VCB",
        accountNumber: "1234567890",
        accountName: "Công ty Greenway",
      },
    ]),
  },
}));

vi.mock("@microsoft/fetch-event-source", () => ({
  fetchEventSource: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: (selector: (s: any) => any) =>
    selector({ accessToken: "fake-token" }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("GarageCashflowExportDrawer", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = (
    props: { open?: boolean; onClose?: () => void } = {},
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowExportDrawer
          open={props.open ?? true}
          onClose={props.onClose ?? vi.fn()}
        />
      </QueryClientProvider>,
    );
  };

  it("renders export drawer with matching conditions structure", async () => {
    renderComponent();

    // Drawer header
    expect(screen.getByText("Xuất Excel thu chi garage")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tạo file theo kỳ và tải lại file đã tạo trong 24 tiếng",
      ),
    ).toBeInTheDocument();

    // Mode selector options
    expect(screen.getByText("Chế độ xuất dữ liệu")).toBeInTheDocument();
    expect(screen.getByText("Theo kỳ")).toBeInTheDocument();
    expect(screen.getByText("Theo filter hiện tại")).toBeInTheDocument();

    // Period options & fields
    expect(screen.getByText("Theo tuần")).toBeInTheDocument();
    expect(screen.getByText("Theo tháng")).toBeInTheDocument();
    expect(screen.getByText("Theo quý")).toBeInTheDocument();
    expect(screen.getByText("Tùy chỉnh")).toBeInTheDocument();
    expect(screen.getByText("Kỳ")).toBeInTheDocument();
    expect(screen.getByText("Từ ngày")).toBeInTheDocument();
    expect(screen.getByText("Đến ngày")).toBeInTheDocument();
    expect(screen.getByText("Tài khoản ngân hàng")).toBeInTheDocument();
    expect(screen.getByText("Loại giao dịch")).toBeInTheDocument();

    // Main action button
    expect(
      screen.getByRole("button", { name: /Xuất Excel/i }),
    ).toBeInTheDocument();
  });

  it("switches to week mode and shows week selector", async () => {
    renderComponent();

    const weekTab = screen.getByText("Theo tuần");
    fireEvent.click(weekTab);

    expect(screen.getByText("Tuần")).toBeInTheDocument();
  });

  it("switches to filter mode when clicked", async () => {
    renderComponent();

    const currentFilterCard = screen.getByText("Theo filter hiện tại");
    fireEvent.click(currentFilterCard);

    expect(screen.getByText("Bộ lọc đang áp dụng")).toBeInTheDocument();
  });

  it("calls startExportExcelBackground when clicking Xuất Excel", async () => {
    renderComponent();

    const exportBtn = screen.getByRole("button", { name: /Xuất Excel/i });
    fireEvent.click(exportBtn);

    expect(garageCashflowApi.startExportExcelBackground).toHaveBeenCalled();
  });
});
