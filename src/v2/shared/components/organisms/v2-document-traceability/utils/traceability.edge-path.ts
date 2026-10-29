import { getSmoothStepPath, Position } from "@xyflow/react";

export interface EdgeGeometryInput {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
}

export interface EdgeGeometry {
  path: string;
  labelX: number;
  labelY: number;
}

const BORDER_RADIUS = 16;
/** Khoảng cách vượt qua hai giai đoạn thì đi đường vòng ra ngoài khung */
const SKIP_VERTICAL = 360;
const SKIP_HORIZONTAL = 450;

/** Đường nối và vị trí nhãn của một cạnh, tự chọn đường vòng khi nối qua giai đoạn xa */
export function computeEdgeGeometry(input: EdgeGeometryInput): EdgeGeometry {
  return input.targetPosition === Position.Top
    ? verticalGeometry(input)
    : horizontalGeometry(input);
}

function verticalGeometry(input: EdgeGeometryInput): EdgeGeometry {
  const { sourceX, sourceY, targetX, targetY } = input;
  if (targetY - sourceY <= SKIP_VERTICAL) {
    const centerY = (sourceY + targetY) / 2;
    const isStraight = Math.abs(targetX - sourceX) < 10;
    return {
      path: smoothPath(input),
      labelX: targetX,
      labelY: isStraight ? centerY : (centerY + targetY) / 2,
    };
  }

  // Đi vòng bên phải, ngoài các khung giai đoạn
  const bypassX = Math.max(sourceX, targetX) + 180;
  const r = BORDER_RADIUS;
  const midY1 = sourceY + 45;
  const midY2 = targetY - 45;
  const outDir = bypassX > sourceX ? r : -r;
  const inDir = targetX > bypassX ? r : -r;
  const path = [
    `M ${sourceX} ${sourceY}`,
    `L ${sourceX} ${midY1 - r}`,
    `Q ${sourceX} ${midY1} ${sourceX + outDir} ${midY1}`,
    `L ${bypassX - outDir} ${midY1}`,
    `Q ${bypassX} ${midY1} ${bypassX} ${midY1 + r}`,
    `L ${bypassX} ${midY2 - r}`,
    `Q ${bypassX} ${midY2} ${bypassX + inDir} ${midY2}`,
    `L ${targetX - inDir} ${midY2}`,
    `Q ${targetX} ${midY2} ${targetX} ${midY2 + r}`,
    `L ${targetX} ${targetY}`,
  ].join(" ");
  return { path, labelX: bypassX, labelY: (midY1 + midY2) / 2 };
}

function horizontalGeometry(input: EdgeGeometryInput): EdgeGeometry {
  const { sourceX, sourceY, targetX, targetY } = input;
  if (targetX - sourceX <= SKIP_HORIZONTAL) {
    const centerX = (sourceX + targetX) / 2;
    const isStraight = Math.abs(targetY - sourceY) < 10;
    return {
      path: smoothPath(input),
      labelX: isStraight ? centerX : (centerX + targetX) / 2,
      labelY: targetY,
    };
  }

  // Đi vòng bên dưới, ngoài các khung giai đoạn
  const bypassY = Math.max(sourceY, targetY) + 65;
  const r = BORDER_RADIUS;
  const midX1 = sourceX + 60;
  const midX2 = targetX - 60;
  const downDir = bypassY > sourceY ? r : -r;
  const upDir = targetY > bypassY ? r : -r;
  const path = [
    `M ${sourceX} ${sourceY}`,
    `L ${midX1 - r} ${sourceY}`,
    `Q ${midX1} ${sourceY} ${midX1} ${sourceY + downDir}`,
    `L ${midX1} ${bypassY - downDir}`,
    `Q ${midX1} ${bypassY} ${midX1 + r} ${bypassY}`,
    `L ${midX2 - r} ${bypassY}`,
    `Q ${midX2} ${bypassY} ${midX2} ${bypassY + upDir}`,
    `L ${midX2} ${targetY - upDir}`,
    `Q ${midX2} ${targetY} ${midX2 + r} ${targetY}`,
    `L ${targetX} ${targetY}`,
  ].join(" ");
  return { path, labelX: (midX1 + midX2) / 2, labelY: bypassY };
}

function smoothPath(input: EdgeGeometryInput): string {
  const [path] = getSmoothStepPath({ ...input, borderRadius: BORDER_RADIUS });
  return path;
}
