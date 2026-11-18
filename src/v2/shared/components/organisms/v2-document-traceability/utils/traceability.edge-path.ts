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

const BORDER_RADIUS = 8;

/**
 * Đường nối trực tiếp ngắn nhất giữa hai chứng từ theo chuẩn sơ đồ khối (Image 2).
 * Tự động đi thẳng khi các node cùng hàng và rẽ góc vuông bo nhẹ R=8 khi lệch hàng,
 * né node trung gian khi nối nhảy cóc qua cột/hàng.
 */
export function computeEdgeGeometry(input: EdgeGeometryInput): EdgeGeometry {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } =
    input;

  // Khi đường nối nhảy qua cột (dx > 320px) và khác hàng (sourceY !== targetY):
  // Rẽ độ cao ngay tại khoảng trống (gap) đầu tiên sau nguồn (sourceX + 60),
  // giúp đường nối hạ/nâng độ cao sớm và đi thẳng bên dưới/trên các thẻ cột giữa.
  const isMultiColumnHorizontal =
    sourcePosition === Position.Right &&
    targetPosition === Position.Left &&
    targetX - sourceX > 320 &&
    sourceY !== targetY;

  // Tương tự cho layout dọc khi nhảy qua hàng (dy > 220px) và khác cột (sourceX !== targetX)
  const isMultiRowVertical =
    sourcePosition === Position.Bottom &&
    targetPosition === Position.Top &&
    targetY - sourceY > 220 &&
    sourceX !== targetX;

  const centerX = isMultiColumnHorizontal ? sourceX + 60 : undefined;
  const centerY = isMultiRowVertical ? sourceY + 40 : undefined;

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: BORDER_RADIUS,
    centerX,
    centerY,
  });

  return { path, labelX, labelY };
}
