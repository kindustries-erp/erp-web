import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { BarChart } from "../BarChart";

const captured: any[] = [];
vi.mock("react-chartjs-2", () => ({
  Chart: (props: any) => {
    captured.push(props);
    return <div data-testid="chart" />;
  },
}));
vi.mock("@/shared/utils/chartSetup", () => ({}));
vi.mock("@/shared/utils/chartTheme", () => ({
  useChartTheme: () => ({ gridColor: "#eee", tickColor: "#999" }),
}));

describe("BarChart", () => {
  it("không thêm trục phụ và plugin khi không bật tùy chọn", () => {
    captured.length = 0;
    render(
      <BarChart labels={["a"]} datasets={[{ data: [1], color: "#000" }]} />,
    );
    const p = captured[0];
    expect(p.options.scales.y1).toBeUndefined();
    expect(p.plugins).toBeUndefined();
  });

  it("thêm trục y1 và plugin nhãn khi có dataset secondaryAxis + dataLabels", () => {
    captured.length = 0;
    render(
      <BarChart
        labels={["a"]}
        dataLabels
        secondaryMin={0}
        datasets={[
          { data: [1], color: "#000" },
          {
            data: [0.4],
            color: "#111",
            type: "line",
            secondaryAxis: true,
            format: (v) => `${Math.round(v * 100)}%`,
          },
        ]}
      />,
    );
    const p = captured[0];
    expect(p.options.scales.y1.position).toBe("right");
    expect(p.plugins).toHaveLength(1);
    expect(p.data.datasets[1].yAxisID).toBe("y1");
    expect(p.data.datasets[1].dataLabelFormat(0.4)).toBe("40%");
  });
});
