import { describe, expect, it } from "vitest";

import { placeLabels, type LabelRequest } from "./edgeLabels";
import type { RouteRect } from "./edgeRouter";

const box = (
  point: { x: number; y: number },
  width: number,
  height: number,
): RouteRect => ({
  x: point.x - width / 2,
  y: point.y - height / 2,
  width,
  height,
});

describe("placeLabels", () => {
  it("hai nhãn không đè nhau khi hai mũi tên gần nhau", () => {
    const requests: LabelRequest[] = [
      {
        id: "a",
        points: [
          { x: 0, y: 100 },
          { x: 400, y: 100 },
        ],
        width: 80,
        height: 20,
      },
      {
        id: "b",
        points: [
          { x: 0, y: 110 },
          { x: 400, y: 110 },
        ],
        width: 80,
        height: 20,
      },
    ];
    const placements = placeLabels(requests, []);
    const a = box(placements.get("a")!, 80, 20);
    const b = box(placements.get("b")!, 80, 20);

    const overlap =
      a.x < b.x + b.width &&
      b.x < a.x + a.width &&
      a.y < b.y + b.height &&
      b.y < a.y + a.height;
    expect(overlap).toBe(false);
  });

  it("nhãn không đè lên thẻ khi có thể tránh", () => {
    const obstacle: RouteRect = { x: 150, y: 80, width: 100, height: 40 };
    const requests: LabelRequest[] = [
      {
        id: "a",
        points: [
          { x: 0, y: 100 },
          { x: 400, y: 100 },
        ],
        width: 60,
        height: 20,
      },
    ];
    const point = placeLabels(requests, [obstacle]).get("a")!;
    const label = box(point, 60, 20);

    const hits =
      label.x < obstacle.x + obstacle.width &&
      obstacle.x < label.x + label.width &&
      label.y < obstacle.y + obstacle.height &&
      obstacle.y < label.y + label.height;
    expect(hits).toBe(false);
  });

  it("nhãn luôn nằm trên đường đi của mũi tên", () => {
    const requests: LabelRequest[] = [
      {
        id: "a",
        points: [
          { x: 0, y: 100 },
          { x: 0, y: 300 },
          { x: 200, y: 300 },
        ],
        width: 60,
        height: 20,
      },
    ];
    const point = placeLabels(requests, []).get("a")!;
    const onPath =
      (point.x === 0 && point.y >= 100 && point.y <= 300) ||
      (point.y === 300 && point.x >= 0 && point.x <= 200);
    expect(onPath).toBe(true);
  });
});
