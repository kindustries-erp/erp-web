import React from "react";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Car } from "lucide-react";
import type { GarageStageClassifications } from "../../../api/garageDashboardApi";

export interface VehicleClassificationDonutProps {
  /** Thống kê số lượng xe theo 4 phân loại ERP */
  classifications?: GarageStageClassifications;
  /** Tổng số lượng xe tiếp nhận */
  total?: number;
  /** Kích thước đường kính Donut (pixel), mặc định 50px */
  size?: number;
  className?: string;
}

/**
 * Component SVG Donut Chart hiển thị cơ cấu các phân loại xe trong xưởng:
 * - 4 phân loại chuẩn ERP:
 *   + Sửa chữa chung: Indigo (#6366f1)
 *   + Ký gửi / Nội bộ: Purple (#a855f7)
 *   + OJ Ngoài: Amber (#f59e0b)
 *   + Khác: Slate (#64748b)
 * - Tâm Donut: Hiển thị icon Xe (Car) và chữ 'loại'
 * - App Tooltip: Hiển thị chi tiết số lượng và tỷ lệ % của từng phân loại xe
 */
export function VehicleClassificationDonutChart({
  classifications,
  total = 0,
  size = 50,
  className,
}: VehicleClassificationDonutProps) {
  const suaChua = classifications?.suaChua || 0;
  const kyGui = classifications?.kyGui || 0;
  const oj = classifications?.oj || 0;
  const khac = classifications?.khac || 0;
  const totalCalculated = suaChua + kyGui + oj + khac;
  const totalVehicles = totalCalculated > 0 ? totalCalculated : total;

  // Thông số hình học SVG tỉ lệ theo size
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 5;
  const r = (size - strokeWidth - 4) / 2;
  const circumference = 2 * Math.PI * r;

  // Tính toán các phân đoạn Donut
  const segments = [
    {
      key: "suaChua",
      label: "Sửa chữa chung",
      count: suaChua,
      color: "#6366f1",
      bgClass: "bg-[#6366f1]",
    },
    {
      key: "kyGui",
      label: "Ký gửi / Nội bộ",
      count: kyGui,
      color: "#a855f7",
      bgClass: "bg-[#a855f7]",
    },
    {
      key: "oj",
      label: "OJ Ngoài",
      count: oj,
      color: "#f59e0b",
      bgClass: "bg-[#f59e0b]",
    },
    {
      key: "khac",
      label: "Khác",
      count: khac,
      color: "#64748b",
      bgClass: "bg-[#64748b]",
    },
  ].filter((s) => s.count > 0);

  let accumulatedLength = 0;
  const renderedSegments = segments.map((seg) => {
    const ratio = totalVehicles > 0 ? seg.count / totalVehicles : 0;
    const length = ratio * circumference;
    const offset = -accumulatedLength;
    accumulatedLength += length;

    return {
      ...seg,
      length,
      offset,
      percent: Math.round(ratio * 1000) / 10,
    };
  });

  const tooltipContent = (
    <div
      className="text-xs flex flex-col gap-1 p-0.5 min-w-[175px]"
      data-testid="classification-tooltip-content"
    >
      <div className="font-semibold text-foreground border-b border-border/60 pb-1 flex justify-between">
        <span>Cơ cấu loại xe</span>
        <span className="font-mono">{totalVehicles} xe</span>
      </div>
      <div className="flex flex-col gap-1 mt-0.5">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
            Sửa chữa chung:
          </span>
          <span className="font-mono font-medium">
            {suaChua} xe{" "}
            {totalVehicles > 0
              ? `(${((suaChua / totalVehicles) * 100).toFixed(0)}%)`
              : ""}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
            <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
            Ký gửi / Nội bộ:
          </span>
          <span className="font-mono font-medium">
            {kyGui} xe{" "}
            {totalVehicles > 0
              ? `(${((kyGui / totalVehicles) * 100).toFixed(0)}%)`
              : ""}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            OJ Ngoài:
          </span>
          <span className="font-mono font-medium">
            {oj} xe{" "}
            {totalVehicles > 0
              ? `(${((oj / totalVehicles) * 100).toFixed(0)}%)`
              : ""}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#64748b]" />
            Khác:
          </span>
          <span className="font-mono font-medium">
            {khac} xe{" "}
            {totalVehicles > 0
              ? `(${((khac / totalVehicles) * 100).toFixed(0)}%)`
              : ""}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} side="top">
      <div
        className={cn(
          "relative shrink-0 flex items-center justify-center cursor-help",
          className,
        )}
        style={{ width: size, height: size }}
        data-testid="vehicle-classification-donut-chart"
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 origin-center overflow-visible"
        >
          {/* Vòng tròn nền xám mờ */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800"
          />

          {/* Các phân đoạn màu cho từng phân loại */}
          {renderedSegments.map((seg) => (
            <circle
              key={seg.key}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={seg.offset}
              className="transition-all duration-500"
              data-testid={`donut-segment-${seg.key}`}
            />
          ))}
        </svg>

        {/* Tâm Donut: Icon xe và nhãn loại */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <Car className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          <span className="text-[7.5px] font-medium text-muted-foreground uppercase leading-none mt-0.5">
            loại
          </span>
        </div>
      </div>
    </Tooltip>
  );
}
