import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2BarChart } from "./V2BarChart";
import { V2DonutChart } from "./V2DonutChart";
import { V2LineChart } from "./V2LineChart";

vi.mock("react-chartjs-2", () => {
  const stub =
    (name: string) =>
    ({ data }: { data: { datasets: unknown[] } }) => (
      <div data-testid={name}>{data.datasets.length}</div>
    );
  return { Bar: stub("bar"), Line: stub("line"), Doughnut: stub("donut") };
});

const series = [
  { key: "in", label: "Mua vào", data: [1000, 2000] },
  { key: "out", label: "Bán ra", data: [3000, 4000] },
];

describe("V2 charts", () => {
  it("renders a bar chart with a legend and one dataset per series", () => {
    render(
      <V2BarChart labels={["T1", "T2"]} series={series} ariaLabel="Doanh số" />,
    );
    expect(screen.getByTestId("bar")).toHaveTextContent("2");
    expect(screen.getByText("Mua vào")).toBeInTheDocument();
    expect(screen.getByText("Bán ra")).toBeInTheDocument();
  });

  it("renders a line chart", () => {
    render(
      <V2LineChart
        labels={["T1", "T2"]}
        series={series}
        ariaLabel="Xu hướng"
      />,
    );
    expect(screen.getByTestId("line")).toBeInTheDocument();
  });

  it("renders a donut chart with one legend entry per slice", () => {
    render(
      <V2DonutChart
        labels={["Đối tác A", "Đối tác B"]}
        values={[60, 40]}
        ariaLabel="Cơ cấu"
      />,
    );
    expect(screen.getByTestId("donut")).toHaveTextContent("1");
    expect(screen.getByText("Đối tác A")).toBeInTheDocument();
  });

  it("offers a table view with formatted numbers", () => {
    render(
      <V2BarChart
        labels={["T1", "T2"]}
        series={series}
        ariaLabel="Doanh số"
        formatValue={(v) => `${v / 1000}K`}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Xem dạng bảng" }));
    expect(screen.getByText("4K")).toBeInTheDocument();
  });

  it("shows an empty state without data", () => {
    render(<V2BarChart labels={[]} series={[]} ariaLabel="Doanh số" />);
    expect(screen.getByText("Chưa có dữ liệu")).toBeInTheDocument();
    expect(screen.queryByTestId("bar")).not.toBeInTheDocument();
  });
});
