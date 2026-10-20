import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ChartTableSwitch } from "./ChartTableSwitch";

describe("ChartTableSwitch", () => {
  it("renders both chart and table labels and responds to clicks", () => {
    const onChange = vi.fn();
    render(<ChartTableSwitch value="chart" onChange={onChange} />);

    expect(screen.getByText("Biểu đồ")).toBeInTheDocument();
    expect(screen.getByText("Bảng số liệu")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Bảng số liệu"));
    expect(onChange).toHaveBeenCalledWith("table");
  });

  it("handles custom labels correctly", () => {
    const onChange = vi.fn();
    render(
      <ChartTableSwitch
        value="table"
        onChange={onChange}
        chartLabel="Graph"
        tableLabel="Grid"
      />,
    );

    expect(screen.getByText("Graph")).toBeInTheDocument();
    expect(screen.getByText("Grid")).toBeInTheDocument();
  });
});
