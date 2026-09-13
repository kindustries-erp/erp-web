import React, { useRef, useEffect, useState, MouseEvent } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

interface KpiSparklineProps {
  data: number[];
  preVatData?: number[];
  customTooltipItems?: Array<{ label: string; data: number[] }>;
  labels?: string[];
  onClick?: (index: number) => void;
}

const externalTooltipHandler = (context: any) => {
  const { chart, tooltip } = context;
  let tooltipEl = document.getElementById("chartjs-tooltip");

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "chartjs-tooltip";
    tooltipEl.style.background = "rgba(15, 23, 42, 0.9)"; // slate-900
    tooltipEl.style.borderRadius = "6px";
    tooltipEl.style.color = "white";
    tooltipEl.style.opacity = "1";
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.position = "fixed";
    tooltipEl.style.transition = "opacity .2s ease";
    tooltipEl.style.zIndex = "99999";
    tooltipEl.style.padding = "8px 12px";
    tooltipEl.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
    tooltipEl.style.textAlign = "center";
    tooltipEl.style.whiteSpace = "nowrap";
    document.body.appendChild(tooltipEl);
  }

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = "0";
    return;
  }

  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map((b: any) => b.lines).flat();

    let innerHtml = "";
    titleLines.forEach((title: string) => {
      innerHtml += `<div style="font-weight: 500; font-size: 12px; color: #94a3b8; margin-bottom: 8px; text-align: left; border-bottom: 1px solid #334155; padding-bottom: 4px;">${title}</div>`;
    });
    bodyLines.forEach((body: string) => {
      const parts = body.split(": ");
      if (parts.length === 2) {
        innerHtml += `<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 4px;">
          <span style="font-weight: 400; font-size: 13px; color: #cbd5e1;">${parts[0]}</span>
          <span style="font-weight: 700; font-size: 14px; color: #f8fafc;">${parts[1]}</span>
        </div>`;
      } else {
        innerHtml += `<div style="font-weight: 700; font-size: 14px; color: #f8fafc; margin-top: 2px; text-align: left;">${body}</div>`;
      }
    });

    tooltipEl.innerHTML = innerHtml;
  }

  const position = chart.canvas.getBoundingClientRect();

  // Calculate left position
  let leftPos = position.left + tooltip.caretX;

  // Adjust if too close to the right edge (assume max tooltip width ~250px)
  const estimatedWidth = 250;
  if (leftPos + estimatedWidth / 2 > window.innerWidth) {
    leftPos = window.innerWidth - estimatedWidth / 2 - 16;
  }

  tooltipEl.style.opacity = "1";
  tooltipEl.style.left = leftPos + "px";
  tooltipEl.style.top = position.top + tooltip.caretY - 12 + "px";
  tooltipEl.style.transform = "translate(-50%, -100%)";
};

export function KpiSparkline({
  data,
  preVatData,
  customTooltipItems,
  labels,
  onClick,
}: KpiSparklineProps) {
  const chartRef = useRef<ChartJS<"line">>(null);
  const [gradient, setGradient] = useState<any>(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      const ctx = chart.ctx;
      const grad = ctx.createLinearGradient(0, 0, 0, chart.height);
      grad.addColorStop(0, "rgba(14, 165, 233, 0.4)");
      grad.addColorStop(1, "rgba(14, 165, 233, 0.0)");
      setGradient(grad);
    }

    return () => {
      // Clean up global tooltip if component unmounts to prevent ghost tooltips
      const tooltipEl = document.getElementById("chartjs-tooltip");
      if (tooltipEl) tooltipEl.style.opacity = "0";
    };
  }, [data]);

  const handleChartClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!onClick || !chartRef.current) return;
    const elements = chartRef.current.getElementsAtEventForMode(
      e.nativeEvent,
      "index",
      { intersect: false },
      true,
    );
    if (elements.length > 0) {
      onClick(elements[0].index);
    }
  };

  const chartData = {
    labels: labels || data.map((_, i) => i.toString()),
    datasets: [
      {
        data,
        borderColor: "#0ea5e9",
        backgroundColor: gradient || "#0ea5e9",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0,
        fill: "start", // Fills down to the bottom of the chart area, aligning even with negative values
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 15, bottom: 2, left: 5, right: 5 }, // Restored nice padding now that tooltip is external
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false, // Disable built-in canvas tooltip
        external: externalTooltipHandler,
        callbacks: {
          title: (context: any) => context[0].label,
          label: (context: any) => {
            const index = context.dataIndex;
            const val = context.parsed.y;
            const format = (n: number) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(n);

            if (customTooltipItems && customTooltipItems.length > 0) {
              return customTooltipItems.map(
                (item) => `${item.label}: ${format(item.data[index] ?? 0)}`,
              );
            }

            if (preVatData) {
              const preVat = preVatData[index];
              return [
                `Doanh thu: ${format(preVat)}`,
                `Doanh thu + VAT: ${format(val)}`,
              ];
            }
            return format(val);
          },
        },
      },
    },
    scales: {
      x: { display: false },
      y: {
        display: false,
        suggestedMin: 0,
        suggestedMax: Math.max(...data) === 0 ? 100 : undefined,
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };

  return (
    <Line
      ref={chartRef}
      data={chartData}
      options={options}
      onClick={handleChartClick}
    />
  );
}
