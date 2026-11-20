import { describe, expect, it } from "vitest";
import {
  toClassRows,
  toFunnelRows,
  toKpiView,
  toProjectedKpiView,
  toVehicleRows,
} from "./casesDashboard.view";
import type {
  CasesDashboardFunnel,
  CasesDashboardFunnelBucket,
  CasesDashboardPeriodKpi,
} from "./casesDashboard.type";

const bucket = (vehicles: number): CasesDashboardFunnelBucket => ({
  totalVehicles: vehicles,
  totalCases: vehicles + 1,
  totalAmount: vehicles * 100,
  stages: {
    quotation: { vehicles: 1, amount: 10, rate: 25 },
    inProgress: { vehicles: 2, amount: 20, rate: 50 },
    completed: { vehicles: 3, amount: 30, rate: 75 },
    cancelled: { vehicles: 0, amount: 0, rate: 0 },
  },
});

describe("casesDashboard.view", () => {
  it("KPI kỳ lấy xe, lệnh và tiền (totalAmountWithTax)", () => {
    const kpi = {
      totalVehicles: 4,
      totalCases: 6,
      totalAmountWithTax: 900,
    } as CasesDashboardPeriodKpi;

    expect(toKpiView(kpi)).toEqual({ vehicles: 4, cases: 6, amount: 900 });
  });

  it("dự thu không có số lệnh nên cases không được đặt", () => {
    const view = toProjectedKpiView({
      totalVehicles: 3,
      totalAmount: 500,
      classifications: {} as never,
    });

    expect(view).toEqual({ vehicles: 3, amount: 500 });
    expect(view.cases).toBeUndefined();
  });

  it("phễu giữ thứ tự báo giá, đang làm, hoàn thành, hủy", () => {
    const rows = toFunnelRows(bucket(3));

    expect(rows.map((r) => r.key)).toEqual([
      "quotation",
      "inProgress",
      "completed",
      "cancelled",
    ]);
    expect(rows[2]).toEqual({
      key: "completed",
      vehicles: 3,
      amount: 30,
      rate: 75,
    });
  });

  it("bảng phân loại lấy tổng distinct của từng phân loại", () => {
    const funnel = {
      overall: bucket(9),
      byMonth: {},
      byClassification: {
        SUA_CHUA_CHUNG: bucket(5),
        KY_GUI_NOI_BO: bucket(0),
        OJ_NGOAI: bucket(2),
        KHAC: bucket(1),
      },
    } as CasesDashboardFunnel;

    const rows = toClassRows(funnel);
    expect(rows.map((r) => r.key)).toEqual([
      "SUA_CHUA_CHUNG",
      "KY_GUI_NOI_BO",
      "OJ_NGOAI",
      "KHAC",
    ]);
    expect(rows[0]).toEqual({
      key: "SUA_CHUA_CHUNG",
      vehicles: 5,
      cases: 6,
      amount: 500,
    });
  });
});

describe("toVehicleRows", () => {
  it("mỗi xe một dòng, nối số phiếu và thay giá trị trống bằng dấu gạch", () => {
    const rows = toVehicleRows([
      {
        vehicleKey: "51B75695",
        licensePlate: "51B-756.95",
        customerName: "Công ty A",
        caseCount: 2,
        caseCodes: ["GN-1", "GN-2"],
        amount: 1500,
        latestAt: null,
        cases: [],
      },
      {
        vehicleKey: "id-9",
        licensePlate: null,
        customerName: null,
        caseCount: 1,
        caseCodes: ["GN-3"],
        amount: 0,
        latestAt: null,
        cases: [],
      },
    ]);

    expect(rows).toEqual([
      {
        key: "51B75695",
        licensePlate: "51B-756.95",
        customerName: "Công ty A",
        caseCount: 2,
        caseCodes: "GN-1, GN-2",
        amount: 1500,
      },
      {
        key: "id-9",
        licensePlate: "—",
        customerName: "—",
        caseCount: 1,
        caseCodes: "GN-3",
        amount: 0,
      },
    ]);
  });
});
