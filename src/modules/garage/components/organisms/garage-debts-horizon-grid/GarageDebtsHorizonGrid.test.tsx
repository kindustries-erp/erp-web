import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { GarageDebtsHorizonGrid } from "./GarageDebtsHorizonGrid";

describe("GarageDebtsHorizonGrid", () => {
  it("renders horizon grid header and switches mode to forecast", () => {
    const onSelectHorizon = vi.fn();
    render(
      <GarageDebtsHorizonGrid
        timeHorizons={{} as any}
        forecastHorizons={{} as any}
        onSelectHorizon={onSelectHorizon}
      />,
    );

    expect(screen.getByText("Phân bổ & Dự báo Công nợ")).toBeInTheDocument();
    expect(screen.getByText("Phân bổ Tuổi nợ")).toBeInTheDocument();
    expect(screen.getByText("Dự báo Thuật toán")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Dự báo Thuật toán"));
    expect(screen.getByText("Dự báo Dòng tiền 7 ngày tới")).toBeInTheDocument();
  });
});
