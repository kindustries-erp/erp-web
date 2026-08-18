import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Position,
  type EdgeProps,
} from "@xyflow/react";
import { cn } from "@/shared/utils";

function renderEdgeLabelContent(rawLabel: any) {
  if (!rawLabel) return null;
  const str = String(rawLabel).trim();

  // 1. Phân tách theo dấu hai chấm ":" (vd: "Thu trực tiếp: 2.160.000 đ" -> dòng 1: "Thu trực tiếp", dòng 2: "2.160.000 đ")
  if (str.includes(":")) {
    const parts = str.split(":");
    const title = parts[0]?.trim();
    const value = parts.slice(1).join(":").trim();
    const titleLower = title.toLowerCase();
    const isThu = titleLower.includes("thu");
    const isChi = titleLower.includes("chi");

    let valClass = "text-slate-900 dark:text-slate-100 font-bold";
    if (isThu) valClass = "text-emerald-600 dark:text-emerald-400 font-bold";
    else if (isChi) valClass = "text-[#ea580c] dark:text-orange-400 font-bold";

    return (
      <div className="flex flex-col items-center justify-center text-center leading-tight py-0.5 px-1 max-w-[130px]">
        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-tight whitespace-nowrap">
          {title}
        </span>
        {value && (
          <span
            className={`text-[10px] font-mono whitespace-nowrap ${valClass}`}
          >
            {value}
          </span>
        )}
      </div>
    );
  }

  // 2. Phân tách theo dấu ngoặc đơn "(...)" (vd: "Doanh thu dịch vụ (HĐ bán)" -> dòng 1: "Doanh thu dịch vụ", dòng 2: "(HĐ bán)")
  if (str.includes("(") && str.includes(")")) {
    const match = str.match(/^(.*?)\s*(\(.*?\))$/);
    if (match) {
      return (
        <div className="flex flex-col items-center justify-center text-center leading-tight py-0.5 px-1 max-w-[130px]">
          <span className="text-[9px] text-slate-700 dark:text-slate-300 font-medium tracking-tight whitespace-nowrap">
            {match[1]?.trim()}
          </span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 italic whitespace-nowrap">
            {match[2]?.trim()}
          </span>
        </div>
      );
    }
  }

  // 3. Chuỗi bình thường (tự động xuống dòng nếu dài)
  return (
    <div className="text-[10px] font-medium text-slate-800 dark:text-slate-200 text-center py-0.5 px-1 max-w-[130px] leading-tight break-words">
      {str}
    </div>
  );
}

export function LabeledSmoothStepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  animated,
}: EdgeProps) {
  let edgePath: string;
  let finalLabelX: number;
  let finalLabelY: number;

  if (targetPosition === Position.Top) {
    // ─── Chiều dọc (Top -> Bottom) ───
    const deltaY = targetY - sourceY;
    const isSkippingStage = deltaY > 360;

    if (isSkippingStage) {
      // Đi đường vòng bên phải ngoài swimlanes
      const bypassX = Math.max(sourceX, targetX) + 180;
      const r = 16;
      const midY1 = sourceY + 45;
      const midY2 = targetY - 45;

      edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${midY1 - r} Q ${sourceX} ${midY1} ${sourceX + (bypassX > sourceX ? r : -r)} ${midY1} L ${bypassX - (bypassX > sourceX ? r : -r)} ${midY1} Q ${bypassX} ${midY1} ${bypassX} ${midY1 + r} L ${bypassX} ${midY2 - r} Q ${bypassX} ${midY2} ${bypassX + (targetX > bypassX ? r : -r)} ${midY2} L ${targetX - (targetX > bypassX ? r : -r)} ${midY2} Q ${targetX} ${midY2} ${targetX} ${midY2 + r} L ${targetX} ${targetY}`;

      finalLabelX = bypassX;
      finalLabelY = (midY1 + midY2) / 2;
    } else {
      const [path] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 16,
      });
      edgePath = path;

      const isStraight = Math.abs(targetX - sourceX) < 10;
      const centerY = (sourceY + targetY) / 2;

      if (isStraight) {
        finalLabelX = targetX;
        finalLabelY = centerY;
      } else {
        // Đặt nhãn tại đoạn dây dọc tiến vào node đích
        finalLabelX = targetX;
        finalLabelY = (centerY + targetY) / 2;
      }
    }
  } else {
    // ─── Chiều ngang (Left -> Right) ───
    const deltaX = targetX - sourceX;
    const isSkippingStage = deltaX > 450;

    if (isSkippingStage) {
      // Đi đường vòng bên dưới ngoài swimlanes
      const bypassLevelY = Math.max(sourceY, targetY) + 65;
      const r = 16;
      const midX1 = sourceX + 60;
      const midX2 = targetX - 60;

      edgePath = `M ${sourceX} ${sourceY} L ${midX1 - r} ${sourceY} Q ${midX1} ${sourceY} ${midX1} ${sourceY + (bypassLevelY > sourceY ? r : -r)} L ${midX1} ${bypassLevelY - (bypassLevelY > sourceY ? r : -r)} Q ${midX1} ${bypassLevelY} ${midX1 + r} ${bypassLevelY} L ${midX2 - r} ${bypassLevelY} Q ${midX2} ${bypassLevelY} ${midX2} ${bypassLevelY + (targetY > bypassLevelY ? r : -r)} L ${midX2} ${targetY - (targetY > bypassLevelY ? r : -r)} Q ${midX2} ${targetY} ${midX2 + r} ${targetY} L ${targetX} ${targetY}`;

      finalLabelX = (midX1 + midX2) / 2;
      finalLabelY = bypassLevelY;
    } else {
      const [path] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 16,
      });
      edgePath = path;

      const isStraight = Math.abs(targetY - sourceY) < 10;
      const centerX = (sourceX + targetX) / 2;

      if (isStraight) {
        finalLabelX = centerX;
        finalLabelY = targetY;
      } else {
        // Đặt nhãn tại đoạn dây ngang tiến vào node đích
        finalLabelX = (centerX + targetX) / 2;
        finalLabelY = targetY;
      }
    }
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${finalLabelX}px,${finalLabelY}px)`,
              pointerEvents: "all",
              zIndex: animated ? 1100 : 1000,
            }}
            className={cn(
              "nodrag nopan select-none px-2 py-0.5 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 backdrop-blur-xs transition-all hover:border-slate-400",
              animated && "shadow-md",
            )}
          >
            {renderEdgeLabelContent(label)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
