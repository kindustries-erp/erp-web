import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ChartFrame } from "./V2ChartFrame";

const base = {
  labels: ["T1", "T2"],
  series: [
    { key: "in", label: "Mua vào", data: [1000, 2500] },
    { key: "out", label: "Bán ra", data: [3000, 4000] },
  ],
  legend: [
    { key: "in", label: "Mua vào", color: "#eb6834" },
    { key: "out", label: "Bán ra", color: "#1baf7a" },
  ],
  ariaLabel: "Doanh số theo tháng",
};

describe("V2ChartFrame", () => {
  it("renders the chart with an accessible name and a legend for two series", () => {
    render(
      <V2ChartFrame {...base}>
        <div>canvas</div>
      </V2ChartFrame>,
    );
    expect(
      screen.getByRole("img", { name: "Doanh số theo tháng" }),
    ).toHaveTextContent("canvas");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("hides the legend for a single series", () => {
    render(
      <V2ChartFrame
        {...base}
        series={[base.series[0]!]}
        legend={[base.legend[0]!]}
      >
        <div>canvas</div>
      </V2ChartFrame>,
    );
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("switches to a table view with formatted values", () => {
    render(
      <V2ChartFrame {...base} formatValue={(v) => `${v} ₫`}>
        <div>canvas</div>
      </V2ChartFrame>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Xem dạng bảng" }));
    expect(
      screen.getByRole("table", { name: "Doanh số theo tháng" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2500 ₫")).toBeInTheDocument();
    expect(screen.queryByText("canvas")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xem biểu đồ" }));
    expect(screen.getByText("canvas")).toBeInTheDocument();
  });

  it("shows an empty state when there is no data", () => {
    render(
      <V2ChartFrame {...base} labels={[]} series={[]} legend={[]}>
        <div>canvas</div>
      </V2ChartFrame>,
    );
    expect(screen.getByText("Chưa có dữ liệu")).toBeInTheDocument();
  });

  it("shows a skeleton while loading", () => {
    const { container } = render(
      <V2ChartFrame {...base} loading>
        <div>canvas</div>
      </V2ChartFrame>,
    );
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByText("canvas")).not.toBeInTheDocument();
  });
});
