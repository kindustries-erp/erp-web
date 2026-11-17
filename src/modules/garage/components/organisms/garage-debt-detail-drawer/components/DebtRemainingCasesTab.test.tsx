import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DebtRemainingCasesTab } from "./DebtRemainingCasesTab";
import type { DebtRemainingCaseRow } from "./DebtRemainingCasesTab.type";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, def?: string) => def || _k,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const mockCases: DebtRemainingCaseRow[] = [
  {
    rowKey: "case-1_KH_ent-1",
    id: "case-1",
    soChungTu: "SC-001",
    ngayHoanThanh: "2026-10-15",
    bienSoXe: "30A-11111",
    khachHangName: "Công ty ABC",
    payerType: "KH",
    partnerType: "enterprise",
    debtorName: "Công ty ABC",
    billed: 10000000,
    paid: 6000000,
    remaining: 4000000,
    cost: 5000000,
    paidCost: 5000000,
    remainingCost: 0,
    invoiceNo: "12345",
  },
  {
    rowKey: "case-2_BH_ins-1",
    id: "case-2",
    soChungTu: "SC-002",
    ngayHoanThanh: "2026-10-20",
    bienSoXe: "51B-22222",
    khachHangName: "Nguyễn Văn B",
    payerType: "BH",
    partnerType: "insurance",
    debtorName: "Bảo hiểm Bảo Việt",
    billed: 8000000,
    paid: 0,
    remaining: 8000000,
    cost: 6000000,
    paidCost: 2000000,
    remainingCost: 4000000,
    vatWarning: true,
  },
  {
    rowKey: "case-3_KH_ind-1",
    id: "case-3",
    soChungTu: "SC-003",
    ngayHoanThanh: "2026-10-25",
    bienSoXe: "29C-33333",
    khachHangName: "Trần Văn C",
    payerType: "KH",
    partnerType: "individual",
    debtorName: "Trần Văn C",
    billed: 2000000,
    paid: 2000000,
    remaining: 0,
    cost: 1000000,
    paidCost: 0,
    remainingCost: 1000000,
  },
];

const renderComponent = (
  props?: Partial<React.ComponentProps<typeof DebtRemainingCasesTab>>,
) =>
  render(
    <QueryClientProvider client={queryClient}>
      <DebtRemainingCasesTab cases={mockCases} {...props} />
    </QueryClientProvider>,
  );

describe("DebtRemainingCasesTab", () => {
  it("chỉ hiển thị các phiếu còn nợ phải thu (remaining > 0) ở chế độ mặc định", () => {
    renderComponent();

    // SC-001 (nợ 4tr) và SC-002 (nợ 8tr) phải xuất hiện
    expect(screen.getByText("SC-001")).toBeInTheDocument();
    expect(screen.getByText("SC-002")).toBeInTheDocument();

    // SC-003 (đã tất toán phải thu, remaining = 0) không được xuất hiện
    expect(screen.queryByText("SC-003")).not.toBeInTheDocument();
  });

  it("hiển thị số thứ tự cột # bắt đầu từ 1", () => {
    renderComponent();

    // Dòng đầu tiên phải có STT 1
    const cellOnes = screen.getAllByText("1");
    expect(cellOnes.length).toBeGreaterThan(0);
  });

  it("gọi onOpenCaseDetail khi click vào số phiếu", () => {
    const handleOpen = vi.fn();
    renderComponent({ onOpenCaseDetail: handleOpen });

    const link = screen.getByText("SC-001");
    fireEvent.click(link);
    expect(handleOpen).toHaveBeenCalledWith("SC-001");
  });

  it("tìm kiếm theo biển số xe hoặc số phiếu hoạt động chính xác", () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText("Tìm số phiếu, xe...");
    fireEvent.change(searchInput, { target: { value: "30A-11111" } });

    expect(screen.getByText("SC-001")).toBeInTheDocument();
    expect(screen.queryByText("SC-002")).not.toBeInTheDocument();
  });

  it("bọc bảng trong DrawerSection với tiêu đề và badge tổng nợ", () => {
    renderComponent();

    // Tiêu đề DrawerSection
    expect(
      screen.getByText("Danh sách phiếu còn phải thu"),
    ).toBeInTheDocument();
    expect(screen.getByText("2 phiếu")).toBeInTheDocument();
  });

  it("chuyển sang Phải trả hiển thị các phiếu có chi phí còn phải chi (remainingCost > 0)", () => {
    renderComponent({ initialDebtType: "payables" });

    // SC-002 (remainingCost = 4tr) và SC-003 (remainingCost = 1tr) phải xuất hiện
    expect(screen.getByText("SC-002")).toBeInTheDocument();
    expect(screen.getByText("SC-003")).toBeInTheDocument();

    // SC-001 (đã trả hết chi phí, remainingCost = 0) không được xuất hiện
    expect(screen.queryByText("SC-001")).not.toBeInTheDocument();
  });
});
