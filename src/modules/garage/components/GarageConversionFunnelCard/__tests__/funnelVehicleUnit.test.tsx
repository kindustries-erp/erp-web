import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FunnelOverviewCards } from "../components/FunnelOverviewCards";
import { FunnelProjectedStats } from "../components/FunnelProjectedStats";
import { StageCardItem } from "../../GarageStatsCards/components/StageCardItem";
import type { GarageProjectedPipeline } from "../../../api/garageDashboardApi";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

const stage = (count: number, amount = 0, rate = 0) => ({
  count,
  amount,
  rate,
});

const projected = (totalCount: number): GarageProjectedPipeline => ({
  totalCount,
  totalAmount: 500,
  byClassification: {
    SUA_CHUA_CHUNG: { name: "", count: 0, amount: 0 },
    KY_GUI_NOI_BO: { name: "", count: 0, amount: 0 },
    OJ_NGOAI: { name: "", count: 0, amount: 0 },
    KHAC: { name: "", count: 0, amount: 0 },
  },
});

describe("Funnel V1: đơn vị XE (không phải phiếu)", () => {
  it("thẻ phễu hiển thị đơn vị 'xe' và không còn 'phiếu'", () => {
    render(
      <FunnelOverviewCards
        totalIntake={stage(7)}
        quotation={stage(2, 200, 20)}
        inProgress={stage(3, 300, 30)}
        completed={stage(4, 400, 40)}
        cancelled={stage(1, 100, 10)}
      />,
    );

    expect(screen.getAllByText("xe").length).toBeGreaterThan(0);
    expect(screen.queryByText("phiếu")).toBeNull();
  });

  it("có chú thích: số xe đếm theo biển số, tổng các giai đoạn có thể lớn hơn tổng xe", () => {
    render(
      <FunnelOverviewCards
        totalIntake={stage(7)}
        quotation={stage(0)}
        inProgress={stage(0)}
        completed={stage(0)}
        cancelled={stage(0)}
      />,
    );

    const note = screen.getByTestId("funnel-vehicle-count-note");
    expect(note.textContent).toContain("biển số");
    expect(note.textContent).toContain("lớn hơn tổng xe");
  });

  it("dự thu hôm nay hiển thị số xe theo projectedToday", () => {
    render(
      <FunnelProjectedStats
        projectedToday={projected(5)}
        projectedMonth={projected(12)}
        fallbackCount={0}
        fallbackAmount={0}
      />,
    );

    const text = document.body.textContent ?? "";
    expect(text).toContain("5 xe");
    expect(text).toContain("12 xe");
    expect(text).not.toContain("phiếu");
  });
});

describe("StageCardItem: tooltip 'N xe · M lệnh'", () => {
  const colorScheme = {
    container: "",
    textTitle: "",
    textCount: "",
    textAmount: "",
  };

  it("hiện số lệnh trong tooltip khi có dữ liệu cases", async () => {
    render(
      <StageCardItem
        stageKey="quotation"
        stageName="Báo giá"
        count={4}
        cases={6}
        testId="stage-card"
        colorScheme={colorScheme}
      />,
    );

    const card = screen.getByTestId("stage-card");
    fireEvent.pointerEnter(card);
    fireEvent.mouseEnter(card);
    fireEvent.focus(card);

    await waitFor(() => {
      expect(screen.getAllByTestId("stage-tooltip-count")[0].textContent).toBe(
        "4 xe · 6 lệnh",
      );
    });
  });

  it("không có cases thì chỉ hiện số xe", async () => {
    render(
      <StageCardItem
        stageKey="quotation"
        stageName="Báo giá"
        count={4}
        testId="stage-card"
        colorScheme={colorScheme}
      />,
    );

    const card = screen.getByTestId("stage-card");
    fireEvent.pointerEnter(card);
    fireEvent.mouseEnter(card);
    fireEvent.focus(card);

    await waitFor(() => {
      expect(screen.getAllByTestId("stage-tooltip-count")[0].textContent).toBe(
        "4 xe",
      );
    });
  });
});
