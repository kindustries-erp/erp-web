import { describe, expect, it } from "vitest";

import { computeGutters, snapToGutters } from "./edgeGutters";
import { routeEdges, type RouteRect } from "./edgeRouter";

const bounds: RouteRect = { x: -50, y: -50, width: 600, height: 500 };
/** Hai cột thẻ, giữa là khe dọc x ∈ (100, 300), tâm 200. */
const A: RouteRect = { x: 0, y: 0, width: 100, height: 60 };
const B: RouteRect = { x: 300, y: 0, width: 100, height: 60 };
const C: RouteRect = { x: 0, y: 200, width: 100, height: 60 };
const D: RouteRect = { x: 300, y: 200, width: 100, height: 60 };

describe("computeGutters", () => {
  it("tìm khe dọc và khe ngang giữa các thẻ", () => {
    const gutters = computeGutters([A, B, C, D]);

    expect(gutters.vertical).toEqual([
      { axis: "x", start: 100, end: 300, center: 200 },
    ]);
    expect(gutters.horizontal).toEqual([
      { axis: "y", start: 60, end: 200, center: 130 },
    ]);
  });

  it("bỏ qua khoảng trống hẹp hơn 40px", () => {
    const near: RouteRect = { x: 120, y: 0, width: 100, height: 60 };
    expect(computeGutters([A, near]).vertical).toHaveLength(0);
  });
});

describe("snapToGutters", () => {
  it("đoạn dọc nằm trong khe được căn về chính giữa khe", () => {
    const [route] = routeEdges([A, B, C, D], bounds, [
      { source: A, target: D },
    ]);
    const vertical = route.points.filter(
      (point, k) =>
        k > 0 &&
        point.x === route.points[k - 1].x &&
        point.y !== route.points[k - 1].y,
    );

    expect(vertical.length).toBeGreaterThan(0);
    vertical.forEach((point) => expect(point.x).toBe(200));
  });

  it("hai mũi tên cùng đi qua khe dàn đối xứng quanh tâm khe", () => {
    const routes = routeEdges([A, B, C, D], bounds, [
      { source: A, target: D },
      { source: C, target: B },
    ]);
    const xs = routes.map((route) => {
      const k = route.points.findIndex(
        (point, i) =>
          i > 0 &&
          point.x === route.points[i - 1].x &&
          point.y !== route.points[i - 1].y,
      );
      return route.points[k].x;
    });

    expect(xs[0] + xs[1]).toBe(400);
    expect(xs[0]).not.toBe(xs[1]);
  });

  it("đoạn đầu và đoạn cuối chạm thẻ không bị di chuyển", () => {
    const original = [
      { x: 100, y: 30 },
      { x: 112, y: 30 },
      { x: 112, y: 230 },
      { x: 300, y: 230 },
    ];
    const gutters = computeGutters([A, B, C, D]);
    const [snapped] = snapToGutters([original], gutters);

    expect(snapped[0]).toEqual({ x: 100, y: 30 });
    expect(snapped[snapped.length - 1]).toEqual({ x: 300, y: 230 });
  });
});
