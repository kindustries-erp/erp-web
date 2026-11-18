import { getSmoothStepPath, type Position } from "@xyflow/react";

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

const BORDER_RADIUS = 8;

/**
 * Đường nối trực tiếp ngắn nhất giữa hai chứng từ theo chuẩn sơ đồ khối (Image 2).
 * Tự động đi thẳng khi các node cùng hàng và rẽ góc vuông bo nhẹ R=8 khi lệch hàng,
 * không đi đường vòng tránh khung.
 */
export function computeEdgeGeometry(input: EdgeGeometryInput): EdgeGeometry {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX: input.sourceX,
    sourceY: input.sourceY,
    sourcePosition: input.sourcePosition,
    targetX: input.targetX,
    targetY: input.targetY,
    targetPosition: input.targetPosition,
    borderRadius: BORDER_RADIUS,
  });

  return { path, labelX, labelY };
}
