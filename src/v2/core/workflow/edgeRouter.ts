import { computeGutters, snapToGutters } from "./edgeGutters";
import type {
  RoutePoint,
  RouteRect,
  RouteInput,
  RouteResult,
} from "./edgeRouter.type";
import {
  EXIT_OFFSET,
  SIDE_DIRECTION,
  candidateSides,
  sidePoint,
} from "./edgeRouter.sides";
import {
  type Grid,
  buildGrid,
  cellCenter,
  findCellPath,
  simplify,
  toCell,
} from "./edgeRouter.grid";
import { alignEndpoints, fallbackRoute, labelAnchor } from "./edgeRouter.path";

export * from "./edgeRouter.type";
export { ROUTE_CELL } from "./edgeRouter.sides";
export { labelAnchor } from "./edgeRouter.path";

/**
 * Định tuyến mũi tên trực giao trên lưới: đường đi tránh mọi thẻ (obstacle),
 * ưu tiên ít lần rẽ. Chạy A* trên lưới ô vuông, rồi rút gọn các điểm thẳng hàng.
 */
/** Định tuyến một mũi tên trên lưới đã có sẵn mật độ; trả về đường đi tốt nhất và các ô đi qua. */
function routeOnGrid(
  grid: Grid,
  source: RouteRect,
  target: RouteRect,
): { points: RoutePoint[]; cells: [number, number][] } | null {
  let best: {
    cost: number;
    points: RoutePoint[];
    cells: [number, number][];
  } | null = null;

  for (const [sourceSide, targetSide] of candidateSides(source, target)) {
    const exitStart = sidePoint(source, sourceSide, EXIT_OFFSET);
    const exitGoal = sidePoint(target, targetSide, EXIT_OFFSET);
    const startCell = toCell(grid, exitStart);
    const goalCell = toCell(grid, exitGoal);
    const cells = findCellPath(
      grid,
      startCell,
      SIDE_DIRECTION[sourceSide],
      goalCell,
    );
    if (!cells) continue;

    // Căn đầu và cuối theo tâm ô lưới để các đoạn thẳng hàng đúng, không bị lệch vài pixel.
    const startCenter = cellCenter(grid, startCell[0], startCell[1]);
    const goalCenter = cellCenter(grid, goalCell[0], goalCell[1]);
    const sourceHorizontal = sourceSide === "left" || sourceSide === "right";
    const targetHorizontal = targetSide === "left" || targetSide === "right";
    const sourceEdge = sidePoint(source, sourceSide, 0);
    const targetEdge = sidePoint(target, targetSide, 0);

    const middle = cells.map(([i, j]) => cellCenter(grid, i, j));
    const gridPoints = simplify([
      sourceHorizontal
        ? { x: sourceEdge.x, y: startCenter.y }
        : { x: startCenter.x, y: sourceEdge.y },
      sourceHorizontal
        ? { x: exitStart.x, y: startCenter.y }
        : { x: startCenter.x, y: exitStart.y },
      ...middle,
      targetHorizontal
        ? { x: exitGoal.x, y: goalCenter.y }
        : { x: goalCenter.x, y: exitGoal.y },
      targetHorizontal
        ? { x: targetEdge.x, y: goalCenter.y }
        : { x: goalCenter.x, y: targetEdge.y },
    ]);
    const points = alignEndpoints(
      gridPoints,
      source,
      sourceSide,
      target,
      targetSide,
    );
    const cost = points.reduce((sum, point, k) => {
      if (k === 0) return sum;
      const prev = points[k - 1];
      return sum + Math.abs(point.x - prev.x) + Math.abs(point.y - prev.y);
    }, 0);
    if (!best || cost < best.cost) best = { cost, points, cells };
  }

  return best ? { points: best.points, cells: best.cells } : null;
}

/**
 * Định tuyến cả batch mũi tên. Mũi tên ngắn được định tuyến trước; mỗi mũi tên đã đi qua ô nào
 * thì các mũi tên sau bị phạt khi đi vào ô đó, nên đường ít chồng lên nhau hơn.
 * Kết quả trả về theo đúng thứ tự đầu vào.
 */
export function routeEdges(
  obstacles: RouteRect[],
  bounds: RouteRect,
  edges: { source: RouteRect; target: RouteRect }[],
): RouteResult[] {
  const grid = buildGrid(bounds, obstacles);
  const center = (rect: RouteRect) => ({
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  });
  const order = edges
    .map((edge, index) => {
      const a = center(edge.source);
      const b = center(edge.target);
      return { index, length: Math.abs(a.x - b.x) + Math.abs(a.y - b.y) };
    })
    .sort(
      (left, right) => left.length - right.length || left.index - right.index,
    );

  const results: RouteResult[] = new Array(edges.length);
  for (const { index } of order) {
    const { source, target } = edges[index];
    const routed = routeOnGrid(grid, source, target);
    if (!routed) {
      results[index] = fallbackRoute(source, target);
      continue;
    }
    routed.cells.forEach(([i, j]) => {
      const cell = j * grid.cols + i;
      grid.usage[cell] = Math.min(grid.usage[cell] + 1, 0xffff);
    });
    results[index] = {
      points: routed.points,
      labelPoint: labelAnchor(routed.points),
    };
  }
  // Căn các đoạn nằm trong khe về chính giữa khe (chia slot đối xứng khi nhiều mũi tên chung khe).
  const snapped = snapToGutters(
    results.map((result) => result.points),
    computeGutters(obstacles),
  );
  return snapped.map((points) => ({ points, labelPoint: labelAnchor(points) }));
}

/** Định tuyến một mũi tên đơn lẻ (không tính mật độ của mũi tên khác). */
export function routeEdge(input: RouteInput): RouteResult {
  return routeEdges(input.obstacles, input.bounds, [
    { source: input.source, target: input.target },
  ])[0];
}
