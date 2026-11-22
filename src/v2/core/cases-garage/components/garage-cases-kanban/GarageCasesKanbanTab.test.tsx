import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GarageCasesKanbanTab } from "./GarageCasesKanbanTab";
import type { GarageCaseDetailRow } from "@/modules/garage/components/organisms/garage-cases-detail-drawer/components/GarageCasesTableTab.type";

const mockCases: GarageCaseDetailRow[] = [
  {
    id: "case-1",
    rowKey: "row-1",
    soChungTu: "SC-001",
    bienSoXe: "51A-123.45",
    hangXeName: "Toyota",
    dongXeName: "Camry",
    namSanXuat: 2021,
    khachHangName: "Nguyễn Văn A",
    khachHangCode: "KH001",
    debtorName: "Nguyễn Văn A",
    payerType: "KH",
    partnerType: "individual",
    tinhTrangDichVu: 2,
    serviceStatus: "Đang sửa chữa",
    billed: 1500000,
    paid: 1000000,
    remaining: 500000,
    cost: 800000,
    paidCost: 800000,
    remainingCost: 0,
    profit: 700000,
  },
  {
    id: "case-2",
    rowKey: "row-2",
    soChungTu: "SC-002",
    bienSoXe: "51A-123.45", // Cùng xe nhưng trạng thái Báo giá -> Tách card riêng ở cột Báo giá!
    hangXeName: "Toyota",
    dongXeName: "Camry",
    namSanXuat: 2021,
    khachHangName: "Nguyễn Văn A",
    debtorName: "Nguyễn Văn A",
    payerType: "KH",
    partnerType: "individual",
    tinhTrangDichVu: 1,
    serviceStatus: "Báo giá",
    billed: 500000,
    paid: 500000,
    remaining: 0,
    cost: 300000,
    paidCost: 300000,
    remainingCost: 0,
    profit: 200000,
  },
  {
    id: "case-3",
    rowKey: "row-3",
    soChungTu: "SC-003",
    bienSoXe: "51A-123.45", // Cùng xe và CÙNG trạng thái Đang sửa chữa với case-1 -> Gom card ở cột Đang làm!
    hangXeName: "Toyota",
    dongXeName: "Camry",
    namSanXuat: 2021,
    khachHangName: "Nguyễn Văn A",
    debtorName: "Nguyễn Văn A",
    payerType: "KH",
    partnerType: "individual",
    tinhTrangDichVu: 2,
    serviceStatus: "Đang sửa chữa",
    billed: 700000,
    paid: 700000,
    remaining: 0,
    cost: 400000,
    paidCost: 400000,
    remainingCost: 0,
    profit: 300000,
  },
  {
    id: "case-4",
    rowKey: "row-4",
    soChungTu: "SC-004",
    bienSoXe: "29B-999.88",
    hangXeName: "VinFast",
    dongXeName: "VF8",
    namSanXuat: 2023,
    khachHangName: "Trần Thị B",
    debtorName: "Trần Thị B",
    payerType: "KH",
    partnerType: "individual",
    tinhTrangDichVu: 3,
    serviceStatus: "Hoàn tất",
    billed: 2000000,
    paid: 2000000,
    remaining: 0,
    cost: 1000000,
    paidCost: 1000000,
    remainingCost: 0,
    profit: 1000000,
  },
];

describe("GarageCasesKanbanTab Component", () => {
  it("renders 5 lanes, tách card khi khác trạng thái và gom card khi cùng trạng thái", () => {
    render(<GarageCasesKanbanTab cases={mockCases} />);

    // Kiểm tra các cột lane có hiển thị
    expect(screen.getByText("Tiếp nhận")).toBeInTheDocument();
    expect(screen.getAllByText("Báo giá").length).toBeGreaterThan(0);
    expect(screen.getByText("Đang làm")).toBeInTheDocument();
    expect(screen.getByText("Hoàn thành")).toBeInTheDocument();
    expect(screen.getByText("Hủy")).toBeInTheDocument();

    // Xe 51A-123.45 xuất hiện ở cả 2 cột: Báo giá (1 card) và Đang làm (1 card gom 2 phiếu)
    expect(screen.getAllByText("51A-123.45").length).toBeGreaterThanOrEqual(2);

    // Kiểm tra hiển thị Loại xe và Đời xe
    expect(screen.getAllByText(/Toyota Camry · 2021/).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(/VinFast VF8 · 2023/)).toBeInTheDocument();

    // Card ở Đang làm gom 2 phiếu -> hiển thị "2 phiếu"
    expect(screen.getByText(/2\s+phiếu/)).toBeInTheDocument();
  });

  it("filters vehicles when searching", () => {
    render(<GarageCasesKanbanTab cases={mockCases} />);

    const searchInput = screen.getByPlaceholderText(/Tìm số phiếu, xe/i);
    fireEvent.change(searchInput, { target: { value: "29B" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(screen.getByText("29B-999.88")).toBeInTheDocument();
    expect(screen.queryByText("51A-123.45")).not.toBeInTheDocument();
  });

  it("calls onOpenCaseDetail when clicking single case code", () => {
    const handleOpen = vi.fn();
    render(
      <GarageCasesKanbanTab cases={mockCases} onOpenCaseDetail={handleOpen} />,
    );

    // Xe 29B-999.88 chỉ có 1 phiếu SC-004
    const caseBtn = screen.getByText("#SC-004");
    fireEvent.click(caseBtn);

    expect(handleOpen).toHaveBeenCalledWith("SC-004");
  });
});
