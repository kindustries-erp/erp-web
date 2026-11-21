import { describe, it, expect } from "vitest";
import type { GarageCaseDetailRow } from "@/modules/garage/components/organisms/garage-cases-detail-drawer/components/GarageCasesTableTab.type";
import {
  determineCaseLane,
  groupCasesByVehicle,
  buildGarageKanbanLanes,
  moveVehicleToLane,
} from "./garageCaseKanban.helper";
import { getGarageKanbanLaneAccent } from "./garageCaseKanban.config";

describe("garageCaseKanban.helper", () => {
  const mockCases: GarageCaseDetailRow[] = [
    {
      rowKey: "c-1",
      id: "1",
      soChungTu: "SC-001",
      bienSoXe: "30A-11111",
      soKhung: "RLM123",
      hangXeName: "Toyota",
      dongXeName: "Camry",
      namSanXuat: 2021,
      khachHangName: "Khách hàng A",
      payerType: "KH",
      partnerType: "individual",
      debtorName: "Khách hàng A",
      billed: 1000000,
      paid: 500000,
      remaining: 500000,
      cost: 400000,
      paidCost: 0,
      remainingCost: 400000,
      tinhTrangDichVu: 2,
      serviceStatus: "Đang sửa chữa",
    },
    {
      rowKey: "c-2",
      id: "2",
      soChungTu: "SC-002",
      bienSoXe: "30A-11111", // Cùng xe 30A-11111 nhưng trạng thái Kết thúc -> tách card riêng!
      khachHangName: "Khách hàng A",
      payerType: "KH",
      partnerType: "individual",
      debtorName: "Khách hàng A",
      billed: 500000,
      paid: 500000,
      remaining: 0,
      cost: 200000,
      paidCost: 0,
      remainingCost: 200000,
      tinhTrangDichVu: 3,
      serviceStatus: "Kết thúc",
      ngayHoanThanh: "2026-11-10",
    },
    {
      rowKey: "c-3",
      id: "3",
      soChungTu: "SC-003",
      bienSoXe: "51F-99999",
      hangXeName: "VinFast",
      dongXeName: "VF8",
      namSanXuat: 2023,
      khachHangName: "Khách hàng B",
      payerType: "KH",
      partnerType: "enterprise",
      debtorName: "Khách hàng B",
      billed: 2000000,
      paid: 0,
      remaining: 2000000,
      cost: 1000000,
      paidCost: 0,
      remainingCost: 1000000,
      tinhTrangDichVu: 1,
      serviceStatus: "Báo giá nháp",
    },
    {
      rowKey: "c-4",
      id: "4",
      soChungTu: "SC-004",
      bienSoXe: "51F-99999", // Cùng xe 51F-99999 và cùng trạng thái Báo giá -> gom chung 1 card!
      khachHangName: "Khách hàng B",
      payerType: "KH",
      partnerType: "enterprise",
      debtorName: "Khách hàng B",
      billed: 1000000,
      paid: 500000,
      remaining: 500000,
      cost: 500000,
      paidCost: 0,
      remainingCost: 500000,
      tinhTrangDichVu: 1,
      serviceStatus: "Báo giá chính thức",
    },
  ];

  it("determineCaseLane phân định đúng làn theo trạng thái", () => {
    expect(determineCaseLane(mockCases[0])).toBe("IN_PROGRESS");
    expect(determineCaseLane(mockCases[1])).toBe("COMPLETED");
    expect(determineCaseLane(mockCases[2])).toBe("QUOTATION");
    expect(determineCaseLane(mockCases[3])).toBe("QUOTATION");

    const cancelledCase: GarageCaseDetailRow = {
      ...mockCases[0],
      tinhTrangDichVu: 9,
      serviceStatus: "Đã hủy",
    };
    expect(determineCaseLane(cancelledCase)).toBe("CANCELLED");
  });

  it("groupCasesByVehicle tách card khi xe có phiếu ở 2 trạng thái khác nhau và gom card khi cùng trạng thái", () => {
    const items = groupCasesByVehicle(mockCases);

    // 30A-11111 (IN_PROGRESS), 30A-11111 (COMPLETED), 51F-99999 (QUOTATION - gom 2 phiếu)
    expect(items).toHaveLength(3);

    const vehicleAInProgress = items.find(
      (v) => v.id === "30A-11111::IN_PROGRESS",
    );
    expect(vehicleAInProgress).toBeDefined();
    expect(vehicleAInProgress?.caseCount).toBe(1);
    expect(vehicleAInProgress?.totalBilled).toBe(1000000);
    expect(vehicleAInProgress?.brandName).toBe("Toyota");
    expect(vehicleAInProgress?.modelName).toBe("Camry");
    expect(vehicleAInProgress?.modelYear).toBe(2021);

    const vehicleACompleted = items.find(
      (v) => v.id === "30A-11111::COMPLETED",
    );
    expect(vehicleACompleted).toBeDefined();
    expect(vehicleACompleted?.caseCount).toBe(1);
    expect(vehicleACompleted?.totalBilled).toBe(500000);

    const vehicleBQuotation = items.find(
      (v) => v.id === "51F-99999::QUOTATION",
    );
    expect(vehicleBQuotation).toBeDefined();
    expect(vehicleBQuotation?.caseCount).toBe(2); // 2 phiếu cùng báo giá
    expect(vehicleBQuotation?.totalBilled).toBe(3000000);
    expect(vehicleBQuotation?.brandName).toBe("VinFast");
    expect(vehicleBQuotation?.modelName).toBe("VF8");
  });

  it("buildGarageKanbanLanes trả về 5 lane với đúng số lượng và subtotal", () => {
    const items = groupCasesByVehicle(mockCases);
    const lanes = buildGarageKanbanLanes(items, (_k, def) => def || _k);

    expect(lanes).toHaveLength(5);

    const inProgressLane = lanes.find((l) => l.id === "IN_PROGRESS");
    expect(inProgressLane?.badgeCount).toBe(1);

    const completedLane = lanes.find((l) => l.id === "COMPLETED");
    expect(completedLane?.badgeCount).toBe(1);

    const quotationLane = lanes.find((l) => l.id === "QUOTATION");
    expect(quotationLane?.badgeCount).toBe(1);

    const intakeLane = lanes.find((l) => l.id === "INTAKE");
    expect(intakeLane?.badgeCount).toBe(0);
  });

  it("moveVehicleToLane cập nhật laneKey và id của xe khi kéo thả", () => {
    const items = groupCasesByVehicle(mockCases);
    const updated = moveVehicleToLane(
      items,
      "30A-11111::IN_PROGRESS",
      "COMPLETED",
    );

    const target = updated.find(
      (v) => v.licensePlate === "30A-11111" && v.laneKey === "COMPLETED",
    );
    expect(target).toBeDefined();
    expect(target?.id).toBe("30A-11111::COMPLETED");
  });

  it("getGarageKanbanLaneAccent trả về đúng semantic token và class cho 5 mốc", () => {
    expect(getGarageKanbanLaneAccent("INTAKE")).toEqual({
      token: "var(--muted-fg)",
      className: "bg-muted-fg",
      fallbackHex: "#64748b",
    });
    expect(getGarageKanbanLaneAccent("QUOTATION")).toEqual({
      token: "var(--warn-fg)",
      className: "bg-warning",
      fallbackHex: "#eab308",
    });
    expect(getGarageKanbanLaneAccent("IN_PROGRESS")).toEqual({
      token: "var(--amber-500, #f59e0b)",
      className: "bg-amber-500",
      fallbackHex: "#f59e0b",
    });
    expect(getGarageKanbanLaneAccent("COMPLETED")).toEqual({
      token: "var(--approve-fg)",
      className: "bg-success",
      fallbackHex: "#10b981",
    });
    expect(getGarageKanbanLaneAccent("CANCELLED")).toEqual({
      token: "var(--destructive)",
      className: "bg-destructive",
      fallbackHex: "#ef4444",
    });
  });
});
