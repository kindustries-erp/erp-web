import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageVehicleProgressRightPanel } from "./GarageVehicleProgressRightPanel";
import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";

const mockCases: GarageCaseDetailRow[] = [
  {
    id: "case-1",
    rowKey: "row-1",
    soChungTu: "SC-001",
    bienSoXe: "51A-123.45",
    hangXeName: "Jaecoo",
    dongXeName: "J7",
    khachHangName: "Nguyễn Văn A",
    debtorName: "Nguyễn Văn A",
    payerType: "KH",
    partnerType: "individual",
    tinhTrangDichVu: 3,
    serviceStatus: "Hoàn thành",
    billed: 2000000,
    paid: 2000000,
    remaining: 0,
    cost: 1000000,
    paidCost: 1000000,
    remainingCost: 0,
  },
  {
    id: "case-2",
    rowKey: "row-2",
    soChungTu: "SC-002",
    bienSoXe: "51B-789.99",
    hangXeName: "Mercedes-Benz",
    dongXeName: "C200",
    khachHangName: "Trần Văn B",
    debtorName: "Trần Văn B",
    payerType: "KH",
    partnerType: "individual",
    tinhTrangDichVu: 2,
    serviceStatus: "Đang làm",
    billed: 5000000,
    paid: 1000000,
    remaining: 4000000,
    cost: 3000000,
    paidCost: 1000000,
    remainingCost: 2000000,
  },
  {
    id: "case-3",
    rowKey: "row-3",
    soChungTu: "SC-003",
    bienSoXe: "30E-444.55",
    hangXeName: "Jaecoo",
    dongXeName: "J7",
    khachHangName: "Lê Văn C",
    debtorName: "Lê Văn C",
    payerType: "KH",
    partnerType: "individual",
    tinhTrangDichVu: 1,
    serviceStatus: "Báo giá",
    billed: 3000000,
    paid: 0,
    remaining: 3000000,
    cost: 1500000,
    paidCost: 0,
    remainingCost: 1500000,
  },
];

describe("GarageVehicleProgressRightPanel", () => {
  it("hiển thị chính xác tiến độ xử lý xe, cơ cấu hãng xe và dòng tiền dịch vụ", () => {
    render(<GarageVehicleProgressRightPanel cases={mockCases} />);

    // 1. Tiến độ dịch vụ xe
    expect(screen.getByText("Tiến độ Dịch vụ Xe")).toBeInTheDocument();
    expect(screen.getByText("3 xe")).toBeInTheDocument();
    // 1 xe hoàn thành / 3 xe = 33.3%
    expect(screen.getByText(/33\.3% Hoàn thành/)).toBeInTheDocument();

    // 2. Cơ cấu hãng xe vào xưởng
    expect(screen.getByText("Cơ cấu Hãng xe vào Xưởng")).toBeInTheDocument();
    expect(screen.getByText("Jaecoo")).toBeInTheDocument();
    expect(screen.getByText("Mercedes-Benz")).toBeInTheDocument();
    expect(screen.getByText("2 xe")).toBeInTheDocument(); // Jaecoo 2 xe
    expect(screen.getByText("1 xe")).toBeInTheDocument(); // Mercedes-Benz 1 xe

    // 3. Dòng tiền dịch vụ xe
    expect(screen.getByText("Dòng tiền Dịch vụ Xe")).toBeInTheDocument();
    expect(screen.getByText("Phát sinh (Có VAT)")).toBeInTheDocument();
    expect(screen.getByText("Đã thu thực tế")).toBeInTheDocument();
    expect(screen.getByText("Còn nợ phải thu")).toBeInTheDocument();
  });
});
