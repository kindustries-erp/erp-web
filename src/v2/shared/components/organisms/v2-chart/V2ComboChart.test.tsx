import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ComboChart } from "./V2ComboChart";
import type { V2ComboSeries } from "./V2Chart.type";

const captured: any[] = [];
vi.mock("react-chartjs-2", () => ({
  Chart: (props: any) => {
    captured.push(props);
    return (
      <div data-testid="combo-chart">
        datasets:{props.data?.datasets?.length}
      </div>
    );
  },
}));

const comboSeries: V2ComboSeries[] = [
  {
    key: "in",
    label: "Đầu vào",
    data: [1000, 2000],
    type: "bar",
    color: "#ea580c",
  },
  {
    key: "out",
    label: "Đầu ra",
    data: [3000, 4000],
    type: "bar",
    color: "#059669",
  },
  {
    key: "profit",
    label: "Lợi nhuận",
    data: [2000, 2000],
    type: "line",
    color: "#2dd4bf",
    tension: 0.3,
  },
];

describe("V2ComboChart", () => {
  it("renders mixed bar and line datasets properly", () => {
    captured.length = 0;
    render(
      <V2ComboChart
        labels={["T1", "T2"]}
        series={comboSeries}
        ariaLabel="Biểu đồ hỗn hợp Doanh thu - Lợi nhuận"
      />,
    );

    expect(screen.getByTestId("combo-chart")).toHaveTextContent("datasets:3");
    expect(screen.getByText("Đầu vào")).toBeInTheDocument();
    expect(screen.getByText("Đầu ra")).toBeInTheDocument();
    expect(screen.getByText("Lợi nhuận")).toBeInTheDocument();

    const chartProps = captured[0];
    expect(chartProps.type).toBe("bar");
    expect(chartProps.data.datasets[0].type).toBe("bar");
    expect(chartProps.data.datasets[1].type).toBe("bar");
    expect(chartProps.data.datasets[2].type).toBe("line");
    expect(chartProps.data.datasets[2].tension).toBe(0.3);
    expect(chartProps.options.interaction.mode).toBe("index");
  });

  it("switches to table view with all series data", () => {
    render(
      <V2ComboChart
        labels={["T1", "T2"]}
        series={comboSeries}
        ariaLabel="Bảng dữ liệu"
        formatValue={(v) => `${v.toLocaleString("vi-VN")} đ`}
      />,
    );

    fireEvent.click(screen.getByLabelText("Xem dạng bảng"));
    expect(
      screen.getByRole("table", { name: "Bảng dữ liệu" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Hạng mục")).toBeInTheDocument();
    expect(screen.getByText("1.000 đ")).toBeInTheDocument();
    expect(screen.getByText("3.000 đ")).toBeInTheDocument();
  });
});
