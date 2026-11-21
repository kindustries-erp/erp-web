import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2TraceCanvasLegend } from "./V2TraceCanvasLegend";
import "../../traceability.locale";

describe("V2TraceCanvasLegend", () => {
  it("renders all legend items with accessible region role", () => {
    render(<V2TraceCanvasLegend />);
    expect(
      screen.getByRole("region", { name: "Chú thích sơ đồ" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Dòng tiền thu")).toBeInTheDocument();
    expect(screen.getByText("Dòng tiền chi")).toBeInTheDocument();
    expect(screen.getByText("Chứng từ đang xem")).toBeInTheDocument();
  });

  it("collapses into compact mode when close button is clicked", () => {
    render(<V2TraceCanvasLegend />);
    const collapseBtn = screen.getByLabelText("Ẩn / hiện bảng chú thích");
    fireEvent.click(collapseBtn);

    expect(screen.queryByText("Dòng tiền thu")).toBeNull();
    expect(screen.getByText("Chú thích")).toBeInTheDocument();
  });

  it("expands back when compact chip is clicked", () => {
    render(<V2TraceCanvasLegend defaultExpanded={false} />);
    expect(screen.getByText("Chú thích")).toBeInTheDocument();

    const expandBtn = screen.getByTestId("v2-trace-canvas-legend-toggle");
    fireEvent.click(expandBtn);

    expect(screen.getByText("Dòng tiền thu")).toBeInTheDocument();
  });
});
