import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChartTableSwitch } from "./ChartTableSwitch";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

describe("ChartTableSwitch", () => {
  it("renders both chart and table labels", () => {
    render(<ChartTableSwitch value="chart" onChange={vi.fn()} />);

    expect(screen.getByText("Biểu đồ")).toBeInTheDocument();
    expect(screen.getByText("Bảng số liệu")).toBeInTheDocument();
  });

  it("calls onChange with 'table' when clicking table label", () => {
    const handleChange = vi.fn();
    render(<ChartTableSwitch value="chart" onChange={handleChange} />);

    fireEvent.click(screen.getByText("Bảng số liệu"));
    expect(handleChange).toHaveBeenCalledWith("table");
  });

  it("calls onChange with 'chart' when clicking chart label", () => {
    const handleChange = vi.fn();
    render(<ChartTableSwitch value="table" onChange={handleChange} />);

    fireEvent.click(screen.getByText("Biểu đồ"));
    expect(handleChange).toHaveBeenCalledWith("chart");
  });

  it("calls onChange when toggling the Switch button", () => {
    const handleChange = vi.fn();
    render(<ChartTableSwitch value="chart" onChange={handleChange} />);

    const switchBtn = screen.getByRole("switch");
    fireEvent.click(switchBtn);
    expect(handleChange).toHaveBeenCalledWith("table");
  });
});
