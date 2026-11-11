import type {
  RoutePoint,
  RouteRect,
  RouteResult,
  RouteSide,
} from "./edgeRouter.type";
import { simplify } from "./edgeRouter.grid";

/** Điểm giữa của đoạn dài nhất, dùng để đặt nhãn. */
export function labelAnchor(points: RoutePoint[]): RoutePoint {
  let best = { length: -1, point: points[0] ?? { x: 0, y: 0 } };
  for (let k = 0; k < points.length - 1; k += 1) {
    const a = points[k];
    const b = points[k + 1];
    const length = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    if (length > best.length) {
      best = { length, point: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
    }
  }
  return best.point;
}

export function fallbackRoute(
  source: RouteRect,
  target: RouteRect,
): RouteResult {
  const points = [
    { x: source.x + source.width / 2, y: source.y + source.height / 2 },
    { x: target.x + target.width / 2, y: target.y + target.height / 2 },
  ];
  return { points, labelPoint: labelAnchor(points) };
}

/** Chèn điểm gấp để mọi đoạn đều nằm ngang hoặc dọc (tránh đoạn chéo sau khi căn tâm). */
export function orthogonalize(
  points: RoutePoint[],
  sourceHorizontal: boolean,
  targetHorizontal: boolean,
): RoutePoint[] {
  const result: RoutePoint[] = [points[0]];
  for (let k = 1; k < points.length; k += 1) {
    const a = result[result.length - 1];
    const b = points[k];
    if (a.x !== b.x && a.y !== b.y) {
      const isFirst = k === 1;
      const isLast = k === points.length - 1;
      const horizontalFirst = isFirst
        ? sourceHorizontal
        : isLast
          ? targetHorizontal
          : Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
      if (horizontalFirst) {
        const midX = (a.x + b.x) / 2;
        result.push({ x: midX, y: a.y }, { x: midX, y: b.y });
      } else {
        const midY = (a.y + b.y) / 2;
        result.push({ x: a.x, y: midY }, { x: b.x, y: midY });
      }
    }
    result.push(b);
  }
  return result;
}

/**
 * Đưa đoạn đầu và đoạn cuối về đúng tâm cạnh thẻ nguồn/đích: ra vào thẻ ở chính giữa cạnh,
 * không lệch theo tâm ô lưới. Đoạn thẳng nối thẳng hai thẻ lệch tâm sẽ được gấp khúc nhẹ.
 */
export function alignEndpoints(
  points: RoutePoint[],
  source: RouteRect,
  sourceSide: RouteSide,
  target: RouteRect,
  targetSide: RouteSide,
): RoutePoint[] {
  const pts = points.map((point) => ({ ...point }));
  const n = pts.length;
  if (n < 2) return pts;

  const sourceHorizontal = sourceSide === "left" || sourceSide === "right";
  const targetHorizontal = targetSide === "left" || targetSide === "right";
  const sourceAxis = sourceHorizontal ? "y" : "x";
  const targetAxis = targetHorizontal ? "y" : "x";
  const sourceValue = sourceHorizontal
    ? source.y + source.height / 2
    : source.x + source.width / 2;
  const targetValue = targetHorizontal
    ? target.y + target.height / 2
    : target.x + target.width / 2;

  const sourceBase = pts[0][sourceAxis];
  let startEnd = 0;
  while (startEnd < n && pts[startEnd][sourceAxis] === sourceBase) {
    pts[startEnd][sourceAxis] = sourceValue;
    startEnd += 1;
  }

  if (startEnd >= n) {
    pts[n - 1][targetAxis] = targetValue;
  } else {
    const targetBase = pts[n - 1][targetAxis];
    let j = n - 1;
    while (j >= startEnd && pts[j][targetAxis] === targetBase) {
      pts[j][targetAxis] = targetValue;
      j -= 1;
    }
  }

  return simplify(orthogonalize(pts, sourceHorizontal, targetHorizontal));
}
