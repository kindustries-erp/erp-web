import type { ChartType, Plugin } from "chart.js";

declare module "chart.js" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- generic phải khớp khai báo gốc của chart.js
  interface PluginOptionsByType<TType extends ChartType> {
    barDataLabels?: DataLabelsOptions;
  }
}

interface DataLabelsOptions {
  color: string;
  /** Ẩn nhãn của đoạn cột chồng thấp hơn tỷ lệ này so với trục (0..1). */
  minStackShare?: number;
}

/** Plugin vẽ nhãn giá trị lên cột/điểm, dùng `dataset.dataLabelFormat` để định dạng. */
export const barDataLabelsPlugin: Plugin<"bar"> = {
  id: "barDataLabels",
  afterDatasetsDraw(chart, _args, opts) {
    const { color, minStackShare = 0.025 } = (opts ?? {}) as DataLabelsOptions;
    const { ctx } = chart;
    ctx.save();
    ctx.font = "9px sans-serif";
    ctx.textAlign = "center";
    chart.data.datasets.forEach((dataset: any, di) => {
      const format = dataset.dataLabelFormat as
        | ((v: number) => string)
        | undefined;
      if (!format || !chart.isDatasetVisible(di)) return;
      const meta = chart.getDatasetMeta(di);
      const scale = chart.scales[meta.yAxisID ?? "y"];
      const span = Math.abs(scale.max - scale.min) || 1;
      const stacked = Boolean(scale.options && (scale.options as any).stacked);
      meta.data.forEach((el: any, i) => {
        const value = dataset.data[i];
        if (value === null || value === undefined || Number(value) === 0)
          return;
        if (stacked && Math.abs(Number(value)) / span < minStackShare) return;
        const { x, y } = el.getProps(["x", "y"], true);
        const base = el.getProps(["base"], true).base as number | undefined;
        const isBar = meta.type === "bar";
        ctx.fillStyle = stacked && isBar ? "#ffffff" : color;
        ctx.textBaseline = stacked && isBar ? "middle" : "bottom";
        const ty = stacked && isBar ? (y + (base ?? y)) / 2 : y - 3;
        ctx.fillText(format(Number(value)), x, ty);
      });
    });
    ctx.restore();
  },
};
