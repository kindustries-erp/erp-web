import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  calculateClassificationTableRows,
  calculateTimelineDatasets,
} from "../utils/funnelDataCalculators";
import { getStatusColor } from "../utils/funnelConfig";
import { FunnelOverviewCards } from "../components/FunnelOverviewCards";
import type { GarageConversionFunnel } from "../../../api/garageDashboardApi";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

const funnel = (over: Partial<GarageConversionFunnel>) =>
  ({
    totalIntake: { count: 10, amount: 1000 },
    quotation: { count: 2, amount: 200, rate: 20 },
    inProgress: { count: 3, amount: 300, rate: 30 },
    completed: { count: 4, amount: 400, rate: 40 },
    cancelled: { count: 1, amount: 100, rate: 10 },
    byClassification: {},
    ...over,
  }) as GarageConversionFunnel;

describe("Funnel: giai đoạn Báo giá", () => {
  it("timeline: có cột chồng Báo giá màu tím, đường % còn lại màu cam", () => {
    const sets = calculateTimelineDatasets(
      ["2026-10"],
      { "2026-10": funnel({}) },
      true,
      ((_k: string, d: string) => d) as never,
    );
    const quote = sets.find((s) => s.label === "Báo giá (Chờ duyệt)");
    expect(quote?.data).toEqual([200]);
    expect(quote?.backgroundColor).toBe("#7C3AED");
    expect(quote?.stack).toBe("timeline");
    expect(sets.find((s) => s.type === "line")?.borderColor).toBe("#EA580C");
  });

  it("bảng: hàng phân loại mang quotationCount/Amount (mặc định 0)", () => {
    const rows = calculateClassificationTableRows({
      SUA_CHUA_CHUNG: {
        name: "Sửa chữa chung",
        totalCount: 5,
        totalAmount: 500,
        quotationCount: 2,
        quotationAmount: 200,
        inProgressCount: 1,
        inProgressAmount: 100,
        completedCount: 2,
        completedAmount: 200,
        cancelledCount: 0,
        cancelledAmount: 0,
        completionRate: 40,
        cancellationRate: 0,
      },
    });
    expect(rows[0].quotationCount).toBe(2);
    expect(rows[0].quotationAmount).toBe(200);
    expect(rows[1].quotationCount).toBe(0);
  });

  it("màu trạng thái Báo giá = tím, Đang thực hiện = slate", () => {
    expect(getStatusColor("Báo giá", 0)).toBe("#7C3AED");
    expect(getStatusColor("Đang thực hiện", 0)).toBe("#475569");
  });

  it("thẻ tổng quan hiển thị 5 giai đoạn đánh số 1-5", () => {
    const f = funnel({});
    render(
      <FunnelOverviewCards
        totalIntake={f.totalIntake}
        quotation={f.quotation!}
        inProgress={f.inProgress}
        completed={f.completed}
        cancelled={f.cancelled}
      />,
    );
    for (const label of [
      "1. Tổng Tiếp Nhận",
      "2. Báo Giá",
      "3. Đang Xử Lý (Dự thu)",
      "4. Đã Hoàn Thành (Doanh thu)",
      "5. Hủy / Từ Chối",
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });
});
