import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { GarageDebtsAgingCardsGrid } from "./GarageDebtsAgingCardsGrid";
import type { GarageTimeHorizonsOverview } from "@/modules/garage/api/garageDebtsAnalyticsApi";

const item = (receivable: number, payable: number) => ({
  receivable,
  payable,
  net: receivable - payable,
});

const timeHorizons: GarageTimeHorizonsOverview = {
  nextWeekDue: item(100, 10),
  nextMonthDue: item(380, 250),
  overdue31To60: item(200, 70),
  overdue61To90: item(90, 30),
  overdue30To90: item(290, 100),
  criticalOverdue90Plus: item(40, 10),
};

describe("GarageDebtsAgingCardsGrid", () => {
  it("hiển thị 5 thẻ tuổi nợ không chồng lấn", () => {
    render(
      <GarageDebtsAgingCardsGrid
        timeHorizons={timeHorizons}
        onSelectHorizon={vi.fn()}
      />,
    );

    expect(screen.getByText("Mới phát sinh (≤ 7 ngày)")).toBeInTheDocument();
    expect(screen.getByText("Trong hạn chuẩn (8–30 ngày)")).toBeInTheDocument();
    expect(screen.getByText("Quá hạn 31-60 ngày")).toBeInTheDocument();
    expect(screen.getByText("Quá hạn 61-90 ngày")).toBeInTheDocument();
    expect(screen.getByText("Quá hạn >90 ngày")).toBeInTheDocument();
    expect(screen.queryByText("Quá hạn 31-90 ngày")).not.toBeInTheDocument();
  });

  it("bấm thẻ 61-90 gọi onSelectHorizon với đúng key", () => {
    const onSelectHorizon = vi.fn();
    render(
      <GarageDebtsAgingCardsGrid
        timeHorizons={timeHorizons}
        onSelectHorizon={onSelectHorizon}
      />,
    );

    fireEvent.click(screen.getByText("Quá hạn 61-90 ngày"));
    expect(onSelectHorizon).toHaveBeenCalledWith("overdue61To90");
  });

  it("bấm thẻ 8-30 gọi đúng key nextMonthDue", () => {
    const onSelectHorizon = vi.fn();
    render(
      <GarageDebtsAgingCardsGrid
        timeHorizons={timeHorizons}
        onSelectHorizon={onSelectHorizon}
      />,
    );

    fireEvent.click(screen.getByText("Trong hạn chuẩn (8–30 ngày)"));
    expect(onSelectHorizon).toHaveBeenCalledWith("nextMonthDue");
  });

  it("khi chưa có dữ liệu vẫn render 5 thẻ, không lỗi", () => {
    render(<GarageDebtsAgingCardsGrid onSelectHorizon={vi.fn()} />);
    expect(screen.getByText("Quá hạn 61-90 ngày")).toBeInTheDocument();
  });
});
