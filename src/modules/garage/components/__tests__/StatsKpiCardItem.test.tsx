import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatsKpiCardItem } from "../GarageStatsCards/components/StatsKpiCardItem";

describe("StatsKpiCardItem - Compact UI with Dual Donuts & Stage Classification", () => {
  const defaultProps = {
    label: "Xe Tháng này",
    onCardClick: vi.fn(),
    onStageClick: vi.fn(),
    data: {
      totalRevenue: 245_350_000,
      totalCost: 144_615_000,
      totalProfit: 100_735_000,
      totalTienCoThue: 248_942_000,
      totalPaid: 218_750_000,
      totalReceivable: 30_192_000,
      collectionRate: 87.9,
      totalCount: 6,
      stages: {
        totalIntake: 15,
        intake: 2,
        intakeAmount: 20_000_000,
        quotation: 3,
        quotationAmount: 50_000_000,
        inProgress: 4,
        inProgressAmount: 70_000_000,
        completed: 6,
        completedAmount: 108_942_000,
        cancelled: 1,
        classifications: {
          suaChua: 1,
          kyGui: 2,
          oj: 4,
          khac: 8,
        },
        byStage: {
          intake: { suaChua: 0, kyGui: 0, oj: 1, khac: 1 },
          quotation: { suaChua: 0, kyGui: 1, oj: 1, khac: 1 },
          inProgress: { suaChua: 0, kyGui: 0, oj: 2, khac: 2 },
          completed: { suaChua: 1, kyGui: 1, oj: 0, khac: 4 },
        },
      },
    },
  };

  it("hiển thị đúng số lượng xe, số tiền rút gọn và 2 donut chart (phân loại xe & thu tiền)", () => {
    render(<StatsKpiCardItem {...defaultProps} />);

    // Label và value số lượng xe
    expect(screen.getByText("Xe Tháng này")).toBeDefined();
    expect(screen.getByText("15 xe")).toBeDefined();

    // Số tiền rút gọn kế bên số xe
    const moneyBadge = screen.getByTestId("compact-money-badge");
    expect(moneyBadge).toBeDefined();
    expect(moneyBadge.textContent).toContain("249tr");

    // Donut 1: Phân loại các loại xe
    expect(
      screen.getByTestId("vehicle-classification-donut-chart"),
    ).toBeDefined();
    expect(screen.getByText("loại")).toBeDefined();

    // Donut 2: Tiến độ thu tiền hiển thị tâm 88%
    expect(screen.getByTestId("collection-donut-chart")).toBeDefined();
    expect(screen.getByTestId("donut-center-rate").textContent).toBe("88%");
    expect(screen.getByText("thu")).toBeDefined();

    // 4 Card Tiến Độ Giai đoạn tiếp nhận kiểu cũ riêng biệt (chuẩn theme, không border trắng)
    expect(screen.getByTestId("card-stage-intake")).toBeDefined();
    expect(screen.getByText("Tiếp nhận")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByTestId("stage-money-intake").textContent).toBe("(20tr)");

    expect(screen.getByTestId("card-stage-quotation")).toBeDefined();
    expect(screen.getByText("Báo giá")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByTestId("stage-money-quotation").textContent).toBe(
      "(50tr)",
    );

    expect(screen.getByTestId("card-stage-in-progress")).toBeDefined();
    expect(screen.getByText("Đang sửa")).toBeDefined();
    expect(screen.getByText("4")).toBeDefined();
    expect(screen.getByTestId("stage-money-in-progress").textContent).toBe(
      "(70tr)",
    );

    expect(screen.getByTestId("card-stage-completed")).toBeDefined();
    expect(screen.getByText("Hoàn tất")).toBeDefined();
    expect(screen.getByText("6")).toBeDefined();
    expect(screen.getByTestId("stage-money-completed").textContent).toBe(
      "(109tr)",
    );

    // Không còn thanh progress bar mini gây rối mắt
    expect(screen.queryByTestId("stage-classification-bar")).toBeNull();

    // KHÔNG CÒN xuất hiện Doanh thu thuần, Giá vốn, Lãi gộp hoặc Eye icon
    expect(screen.queryByText(/Doanh thu:/)).toBeNull();
    expect(screen.queryByText(/Giá vốn:/)).toBeNull();
    expect(screen.queryByText(/Lãi gộp:/)).toBeNull();
    expect(screen.queryByText(/xe hoàn tất/)).toBeNull();
  });

  it("khi click vào Card Tiến Độ Báo giá, gọi onStageClick mà không kích hoạt onCardClick", () => {
    const onCardClick = vi.fn();
    const onStageClick = vi.fn();

    render(
      <StatsKpiCardItem
        {...defaultProps}
        onCardClick={onCardClick}
        onStageClick={onStageClick}
      />,
    );

    const quotationCard = screen.getByTestId("card-stage-quotation");
    fireEvent.click(quotationCard);

    expect(onStageClick).toHaveBeenCalledWith("quotation", "Báo giá");
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it("khi click vào thẻ, gọi onCardClick", () => {
    const onCardClick = vi.fn();
    render(<StatsKpiCardItem {...defaultProps} onCardClick={onCardClick} />);

    const label = screen.getByText("Xe Tháng này");
    fireEvent.click(label);

    expect(onCardClick).toHaveBeenCalled();
  });
});
