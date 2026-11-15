import { describe, expect, it } from "vitest";

import {
  labelAnchor,
  ROUTE_CELL,
  routeEdge,
  routeEdges,
  type RouteRect,
} from "./edgeRouter";

const bounds: RouteRect = { x: 0, y: 0, width: 800, height: 400 };
const source: RouteRect = { x: 0, y: 150, width: 100, height: 60 };
const target: RouteRect = { x: 600, y: 150, width: 100, height: 60 };

/** Lấy mẫu các điểm dọc đường đi và kiểm tra không nằm sâu trong thẻ nào. */
function crossesObstacle(
  points: { x: number; y: number }[],
  obstacle: RouteRect,
): boolean {
  for (let k = 0; k < points.length - 1; k += 1) {
    const a = points[k];
    const b = points[k + 1];
    const steps = 40;
    for (let s = 1; s < steps; s += 1) {
      const x = a.x + ((b.x - a.x) * s) / steps;
      const y = a.y + ((b.y - a.y) * s) / steps;
      const inside =
        x > obstacle.x + 1 &&
        x < obstacle.x + obstacle.width - 1 &&
        y > obstacle.y + 1 &&
        y < obstacle.y + obstacle.height - 1;
      if (inside) return true;
    }
  }
  return false;
}

describe("routeEdge", () => {
  it("không có thẻ cản thì đi thẳng ngang giữa hai thẻ", () => {
    const { points } = routeEdge({ obstacles: [], bounds, source, target });

    expect(points).toHaveLength(2);
    expect(points[0].x).toBe(100);
    expect(points[1].x).toBe(600);
    expect(points[0].y).toBe(points[1].y);
    expect(Math.abs(points[0].y - 180)).toBeLessThanOrEqual(ROUTE_CELL);
  });

  it("vòng qua thẻ đặt chắn ở giữa, không cắt thẻ đó", () => {
    const blocker: RouteRect = { x: 300, y: 100, width: 120, height: 200 };
    const { points } = routeEdge({
      obstacles: [blocker],
      bounds,
      source,
      target,
    });

    expect(crossesObstacle(points, blocker)).toBe(false);
    expect(points.length).toBeGreaterThan(2);
  });

  it("điểm đầu và cuối nằm đúng ở cạnh của thẻ nguồn và đích", () => {
    const blocker: RouteRect = { x: 300, y: 100, width: 120, height: 200 };
    const { points } = routeEdge({
      obstacles: [blocker],
      bounds,
      source,
      target,
    });

    expect(points[0].x).toBe(source.x + source.width);
    expect(points[points.length - 1].x).toBe(target.x);
  });

  it("nhãn nằm trên một đoạn của đường đi", () => {
    const blocker: RouteRect = { x: 300, y: 100, width: 120, height: 200 };
    const { points, labelPoint } = routeEdge({
      obstacles: [blocker],
      bounds,
      source,
      target,
    });

    const onSegment = points.some((a, k) => {
      const b = points[k + 1];
      if (!b) return false;
      const minX = Math.min(a.x, b.x);
      const maxX = Math.max(a.x, b.x);
      const minY = Math.min(a.y, b.y);
      const maxY = Math.max(a.y, b.y);
      return (
        labelPoint.x >= minX - 0.5 &&
        labelPoint.x <= maxX + 0.5 &&
        labelPoint.y >= minY - 0.5 &&
        labelPoint.y <= maxY + 0.5
      );
    });
    expect(onSegment).toBe(true);
  });
});

describe("labelAnchor", () => {
  it("chọn điểm giữa của đoạn dài nhất", () => {
    const anchor = labelAnchor([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 100 },
    ]);
    expect(anchor).toEqual({ x: 10, y: 50 });
  });
});

describe("routeEdges", () => {
  it("hai mũi tên cùng cặp thẻ không đi trùng đường hoàn toàn", () => {
    const sourceCard: RouteRect = { x: 0, y: 150, width: 100, height: 60 };
    const targetCard: RouteRect = { x: 600, y: 150, width: 100, height: 60 };
    const [first, second] = routeEdges([sourceCard, targetCard], bounds, [
      { source: sourceCard, target: targetCard },
      { source: sourceCard, target: targetCard },
    ]);

    expect(JSON.stringify(first.points)).not.toBe(
      JSON.stringify(second.points),
    );
  });
});

describe("căn tâm cạnh thẻ", () => {
  it("điểm đầu và cuối nằm đúng tâm cạnh thẻ dù hai thẻ cao khác nhau, và mọi đoạn đều ngang hoặc dọc", () => {
    const tall: RouteRect = { x: 0, y: 100, width: 100, height: 100 };
    const short: RouteRect = { x: 400, y: 120, width: 100, height: 40 };
    const [route] = routeEdges([tall, short], bounds, [
      { source: tall, target: short },
    ]);
    const first = route.points[0];
    const last = route.points[route.points.length - 1];

    expect(first).toEqual({ x: 100, y: 150 });
    expect(last).toEqual({ x: 400, y: 140 });
    route.points.forEach((point, k) => {
      if (k === 0) return;
      const prev = route.points[k - 1];
      expect(point.x === prev.x || point.y === prev.y).toBe(true);
    });
  });
});
