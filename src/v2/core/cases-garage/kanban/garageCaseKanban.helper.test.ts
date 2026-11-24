import { describe, it, expect } from "vitest";
import {
  determineCaseLane,
  groupCasesByVehicle,
  buildGarageKanbanLanes,
} from "./garageCaseKanban.helper";
import { mockCases } from "./garageCaseKanban.fixtures";
import type { GarageCaseV2InfoMap } from "./garageCaseKanban.type";

describe("garageCaseKanban.helper", () => {
  it("determineCaseLane theo mã KGara khi chưa có thông tin v2", () => {
    expect(determineCaseLane(mockCases[0])).toBe("IN_PROGRESS");
    expect(determineCaseLane(mockCases[1])).toBe("COMPLETED");
    expect(determineCaseLane(mockCases[2])).toBe("QUOTATION");
    expect(determineCaseLane({ ...mockCases[0], tinhTrangDichVu: 9 })).toBe(
      "CANCELLED",
    );
  });

  it("determineCaseLane không đoán theo text, mã thiếu hoặc lạ rơi về INTAKE", () => {
    const row = { ...mockCases[0], serviceStatus: "Đã hủy" };
    expect(determineCaseLane({ ...row, tinhTrangDichVu: undefined })).toBe(
      "INTAKE",
    );
    expect(determineCaseLane({ ...row, tinhTrangDichVu: 42 })).toBe("INTAKE");
  });

  it("determineCaseLane ưu tiên status v2 đã sửa đè (xe báo giá lùi về Tiếp nhận)", () => {
    const quoted = mockCases[2]; // mã KGara = 1 (báo giá)
    const info: GarageCaseV2InfoMap = {
      [quoted.id]: {
        status: "INTAKE",
        progressStage: null,
        statusOverridden: true,
      },
    };
    expect(determineCaseLane(quoted)).toBe("QUOTATION");
    expect(determineCaseLane(quoted, info)).toBe("INTAKE");
  });

  it("groupCasesByVehicle tách card khi xe có phiếu ở 2 trạng thái khác nhau và gom card khi cùng trạng thái", () => {
    const items = groupCasesByVehicle(mockCases);
    expect(items).toHaveLength(3);

    const inProgress = items.find((v) => v.id === "30A-11111::IN_PROGRESS");
    expect(inProgress?.caseCount).toBe(1);
    expect(inProgress?.totalBilled).toBe(1000000);
    expect(inProgress?.brandName).toBe("Toyota");
    expect(inProgress?.modelName).toBe("Camry");
    expect(inProgress?.modelYear).toBe(2021);

    const completed = items.find((v) => v.id === "30A-11111::COMPLETED");
    expect(completed?.caseCount).toBe(1);
    expect(completed?.totalBilled).toBe(500000);

    const quotation = items.find((v) => v.id === "51F-99999::QUOTATION");
    expect(quotation?.caseCount).toBe(2);
    expect(quotation?.totalBilled).toBe(3000000);
    expect(quotation?.brandName).toBe("VinFast");
    expect(quotation?.modelName).toBe("VF8");
  });

  it("groupCasesByVehicle gom theo status v2, mang công đoạn và dấu sửa đè lên thẻ", () => {
    const info: GarageCaseV2InfoMap = {
      "1": {
        status: "IN_PROGRESS",
        progressStage: "PAINTING",
        statusOverridden: false,
      },
      "3": {
        status: "INTAKE",
        progressStage: null,
        statusOverridden: true,
      },
      "4": {
        status: "INTAKE",
        progressStage: null,
        statusOverridden: true,
      },
    };
    const items = groupCasesByVehicle(mockCases, info);

    const car = items.find((v) => v.id === "30A-11111::IN_PROGRESS");
    expect(car?.progressStage).toBe("PAINTING");
    expect(car?.statusOverridden).toBe(false);

    const intake = items.find((v) => v.id === "51F-99999::INTAKE");
    expect(intake?.caseCount).toBe(2);
    expect(intake?.statusOverridden).toBe(true);
    expect(items.find((v) => v.id === "51F-99999::QUOTATION")).toBeUndefined();
  });

  it("buildGarageKanbanLanes luôn trả đủ 5 lane (kể cả INTAKE trống để làm đích kéo thả)", () => {
    const items = groupCasesByVehicle(mockCases);
    const lanes = buildGarageKanbanLanes(items, (_k, def) => def || _k);

    expect(lanes).toHaveLength(5);
    const count = (id: string) =>
      lanes.find((l) => l.id === id)?.badgeCount ?? -1;
    expect(count("IN_PROGRESS")).toBe(1);
    expect(count("COMPLETED")).toBe(1);
    expect(count("QUOTATION")).toBe(1);
    expect(count("INTAKE")).toBe(0);
    expect(count("CANCELLED")).toBe(0);
  });
});
