import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCasesTableTab } from "./GarageCasesTableTab";
import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockCases: GarageCaseDetailRow[] = [
  {
    rowKey: "row-1",
    id: "case-1",
    soChungTu: "SC-001",
    ngayHoanThanh: "2026-11-10",
    bienSoXe: "51K-12345",
    khachHangName: "Công ty ABC",
    khachHangCode: "KH001",
    payerType: "KH",
    partnerType: "enterprise",
    debtorName: "Công ty ABC",
    billed: 10000000,
    paid: 6000000,
    remaining: 4000000,
    cost: 5000000,
    paidCost: 2000000,
    remainingCost: 3000000,
    revenue: 9090909,
    profit: 4090909,
    classification: "SUA_CHUA_CHUNG",
  },
  {
    rowKey: "row-2",
    id: "case-2",
    soChungTu: "SC-002",
    ngayHoanThanh: "2026-11-12",
    bienSoXe: "51L-67890",
    khachHangName: "Nguyễn Văn B",
    khachHangCode: "KH002",
    payerType: "KH",
    partnerType: "individual",
    debtorName: "Nguyễn Văn B",
    billed: 5000000,
    paid: 5000000,
    remaining: 0,
    cost: 3000000,
    paidCost: 3000000,
    remainingCost: 0,
    revenue: 4545455,
    profit: 1545455,
    classification: "OJ_NGOAI",
  },
];

describe("GarageCasesTableTab: Sub-tab trạng thái phễu và phân loại ERP", () => {
  it("đã xóa nút Phải thu / Phải trả theo yêu cầu", () => {
    render(<GarageCasesTableTab cases={mockCases} showProfitMetrics={true} />, {
      wrapper: createWrapper(),
    });

    // Có ô tìm kiếm
    expect(
      screen.getByPlaceholderText("Tìm số phiếu, xe..."),
    ).toBeInTheDocument();

    // KHÔNG có nút switch Phải thu / Phải trả
    expect(screen.queryByText("Phải thu")).not.toBeInTheDocument();
    expect(screen.queryByText("Phải trả")).not.toBeInTheDocument();

    // Tiêu đề section là Danh sách vụ việc dịch vụ trong kỳ
    expect(
      screen.getByText("Danh sách vụ việc dịch vụ trong kỳ"),
    ).toBeInTheDocument();

    // Cột Phát sinh và các cột Doanh thu
    expect(screen.getByText("Phát sinh")).toBeInTheDocument();
    expect(screen.getByText("Doanh thu thuần")).toBeInTheDocument();
    expect(screen.getByText("Lợi nhuận gộp")).toBeInTheDocument();
  });

  it("hiển thị 5 sub-tab phân loại ERP khi mở từ Card Doanh thu (classification không truyền hoặc là ALL)", () => {
    render(<GarageCasesTableTab cases={mockCases} showProfitMetrics={true} />, {
      wrapper: createWrapper(),
    });

    // 5 phân loại ERP trên sub-tab
    expect(screen.getByRole("tab", { name: /Tất cả/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Sửa chữa chung/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Ký gửi \/ Nội bộ/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /OJ Ngoài/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Khác/i })).toBeInTheDocument();
  });

  it("hiển thị 5 sub-tab trạng thái phễu chuyển đổi khi click phân loại ERP từ card Phễu", () => {
    const funnelCases: GarageCaseDetailRow[] = [
      {
        ...mockCases[0],
        rowKey: "row-quote",
        id: "case-quote",
        soChungTu: "SC-QUOTE",
        ngayHoanThanh: undefined,
        tinhTrangDichVu: 1,
        serviceStatus: "Báo giá",
      },
      {
        ...mockCases[0],
        rowKey: "row-progress",
        id: "case-progress",
        soChungTu: "SC-PROGRESS",
        ngayHoanThanh: undefined,
        tinhTrangDichVu: 2,
        serviceStatus: "Đang sửa",
      },
      {
        ...mockCases[0],
        rowKey: "row-done",
        id: "case-done",
        soChungTu: "SC-DONE",
        ngayHoanThanh: "2026-11-15",
        tinhTrangDichVu: 3,
        serviceStatus: "Đã giao xe",
      },
      {
        ...mockCases[0],
        rowKey: "row-cancelled",
        id: "case-cancelled",
        soChungTu: "SC-CANCEL",
        ngayHoanThanh: undefined,
        tinhTrangDichVu: 9,
        serviceStatus: "Đã hủy",
      },
    ];

    render(
      <GarageCasesTableTab
        cases={funnelCases}
        showProfitMetrics={true}
        classification="SUA_CHUA_CHUNG"
      />,
      { wrapper: createWrapper() },
    );

    // 5 trạng thái phễu
    expect(
      screen.getByRole("tab", { name: /Tổng tiếp nhận/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Báo giá/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Đang làm \(Dự thu\)/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Hoàn thành \(Doanh thu\)/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Đã hủy/i })).toBeInTheDocument();

    // Click sub-tab Báo giá -> Lọc chỉ còn SC-QUOTE
    const quotationTab = screen.getByRole("tab", { name: /Báo giá/i });
    fireEvent.click(quotationTab);

    expect(screen.getByText("SC-QUOTE")).toBeInTheDocument();
    expect(screen.queryByText("SC-PROGRESS")).not.toBeInTheDocument();
    expect(screen.queryByText("SC-DONE")).not.toBeInTheDocument();
    expect(screen.queryByText("SC-CANCEL")).not.toBeInTheDocument();
  });

  it("lọc danh sách xe khi gõ tìm kiếm biển số xe hoặc số chứng từ", () => {
    render(<GarageCasesTableTab cases={mockCases} showProfitMetrics={true} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("51K-12345")).toBeInTheDocument();
    expect(screen.getByText("51L-67890")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Tìm số phiếu, xe...");
    fireEvent.change(searchInput, { target: { value: "51K" } });

    expect(screen.getByText("51K-12345")).toBeInTheDocument();
  });
});
