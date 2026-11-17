import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGaragePartnerMonthDetailDrawerLogic } from "./GaragePartnerMonthDetailDrawer.hook";

vi.mock("@/modules/garage/api/garageApi", () => ({
  garageApi: { getCasesByCustomer: vi.fn().mockResolvedValue([]) },
}));

const cases = [
  {
    id: "old",
    soChungTu: "GR-OLD",
    ngayHoanThanhCongViec: "2026-06-10",
    classification: "SUA_CHUA_CHUNG",
    isCompleted: true,
  },
  {
    id: "oct",
    soChungTu: "GR-OCT",
    ngayHoanThanhCongViec: "2026-10-05",
    classification: "SUA_CHUA_CHUNG",
    isCompleted: true,
  },
  {
    id: "aug",
    soChungTu: "GR-AUG",
    ngayHoanThanhCongViec: "2026-08-20",
    classification: "SUA_CHUA_CHUNG",
    isCompleted: true,
  },
];

function renderLogic(props: Record<string, unknown>) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(
    () =>
      useGaragePartnerMonthDetailDrawerLogic({
        open: true,
        customerCode: "C1",
        branchId: "branch-01",
        initialCases: cases,
        ...props,
      } as any),
    { wrapper },
  ).result.current;
}

describe("GaragePartnerMonthDetailDrawer: phạm vi theo mốc tuổi nợ", () => {
  it("mốc: giữ mọi phiếu đã hoàn thành trong danh sách breakdown, bỏ qua lọc theo tháng", () => {
    const logic = renderLogic({
      horizon: "overdue31To60",
      month: "",
      periodLabel: "Quá hạn 31-60 ngày",
    });
    expect(logic.monthCases.map((c: any) => c.id)).toEqual([
      "old",
      "oct",
      "aug",
    ]);
    expect(logic.monthLabel).toBe("Quá hạn 31-60 ngày");
  });

  it("tháng: chỉ giữ phiếu có ngày hoàn thành trong tháng đó", () => {
    const logic = renderLogic({ month: "2026-10" });
    expect(logic.monthCases.map((c: any) => c.id)).toEqual(["oct"]);
    expect(logic.monthLabel).toBe("Tháng 10/2026");
  });
});
