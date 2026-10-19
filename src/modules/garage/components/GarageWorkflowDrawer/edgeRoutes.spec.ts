import { describe, expect, it } from "vitest";

import { estimateCardHeight } from "./GarageWorkflowCanvas";
import { canvasBounds } from "./canvasBounds";
import { canvasHeaderRects } from "./canvasHeaderRects";
import {
  estimateLabelSize,
  placeLabels,
  type LabelRequest,
} from "./edgeLabels";
import { routeEdges, type RouteRect, type RoutePoint } from "./edgeRouter";
import {
  GARAGE_WORKFLOW_CANVASES,
  GARAGE_WORKFLOW_CANVAS_ORDER,
} from "./garageWorkflowData";
import type { GarageWorkflowCanvasDefinition } from "./garageWorkflowTypes";
import { WORKFLOW_NODE_WIDTH } from "./garageWorkflowTypes";

/** Đường đi có đi sâu vào thẻ nào không (sample dọc từng đoạn). */
function crossesAnyCard(points: RoutePoint[], cards: RouteRect[]): boolean {
  for (let k = 0; k < points.length - 1; k += 1) {
    const a = points[k];
    const b = points[k + 1];
    for (let s = 1; s < 40; s += 1) {
      const x = a.x + ((b.x - a.x) * s) / 40;
      const y = a.y + ((b.y - a.y) * s) / 40;
      if (
        cards.some(
          (c) =>
            x > c.x + 2 &&
            x < c.x + c.width - 2 &&
            y > c.y + 2 &&
            y < c.y + c.height - 2,
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

const hits = (a: RouteRect, b: RouteRect) =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

/** Chuỗi chữ hiển thị gần đúng để ước lượng kích thước nhãn. */
function labelSize(canvas: GarageWorkflowCanvasDefinition, edgeId: string) {
  const edge = canvas.edges.find((e) => e.id === edgeId)!;
  return estimateLabelSize(
    edge.label?.fallback ?? "",
    edge.mechanism ?? "",
    edge.step !== undefined || edge.steps !== undefined,
  );
}

function setup(canvas: GarageWorkflowCanvasDefinition, showRead: boolean) {
  const visibleNodes = canvas.nodes.filter(
    (node) => showRead || node.layer !== "read",
  );
  const rects = new Map<string, RouteRect>(
    visibleNodes.map((node) => [
      node.id,
      {
        x: node.x,
        y: node.y,
        width: WORKFLOW_NODE_WIDTH,
        height: estimateCardHeight(
          node.title.fallback,
          (node.badges ?? []).map((b) => b.fallback),
        ),
      },
    ]),
  );
  const edges = canvas.edges.filter(
    (edge) =>
      (showRead || edge.kind !== "read") &&
      rects.has(edge.source) &&
      rects.has(edge.target),
  );
  const cards = [...rects.values()];
  const headers = canvasHeaderRects(canvas, { showRead });
  const obstacles = [...cards, ...headers];
  const routes = routeEdges(
    obstacles,
    canvasBounds(canvas, { showRead }),
    edges.map((edge) => ({
      source: rects.get(edge.source)!,
      target: rects.get(edge.target)!,
    })),
  );
  return { edges, cards, obstacles, routes };
}

describe("đường đi và nhãn mũi tên trên dữ liệu thật", () => {
  it.each(
    GARAGE_WORKFLOW_CANVAS_ORDER.flatMap((id) => [
      [id, false] as const,
      [id, true] as const,
    ]),
  )(
    "canvas %s (hiện luồng đọc: %s): mũi tên không cắt thẻ hay tiêu đề, nhãn không đè nhau và không đè thẻ hay tiêu đề",
    (id, showRead) => {
      const canvas = GARAGE_WORKFLOW_CANVASES[id];
      const { edges, obstacles, routes } = setup(canvas, showRead);

      routes.forEach((route, index) => {
        expect(
          crossesAnyCard(route.points, obstacles),
          `mũi tên ${edges[index].id} cắt thẻ`,
        ).toBe(false);
      });

      const requests: LabelRequest[] = edges.map((edge, index) => ({
        id: edge.id,
        points: routes[index].points,
        ...labelSize(canvas, edge.id),
      }));
      const placements = placeLabels(requests, obstacles);
      const boxes = requests.map((request) => {
        const point = placements.get(request.id)!;
        return {
          id: request.id,
          rect: {
            x: point.x - request.width / 2,
            y: point.y - request.height / 2,
            width: request.width,
            height: request.height,
          },
        };
      });

      boxes.forEach((a, i) => {
        boxes.slice(i + 1).forEach((b) => {
          expect(hits(a.rect, b.rect), `nhãn ${a.id} đè nhãn ${b.id}`).toBe(
            false,
          );
        });
        obstacles.forEach((obstacle, k) => {
          expect(
            hits(a.rect, obstacle),
            `nhãn ${a.id} đè thẻ hoặc tiêu đề ${k}`,
          ).toBe(false);
        });
      });
    },
  );
});
