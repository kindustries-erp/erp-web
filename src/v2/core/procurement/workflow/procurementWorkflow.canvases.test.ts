import { describe, expect, it } from "vitest";

import {
  WORKFLOW_CARD_MIN_HEIGHT,
  WORKFLOW_NODE_WIDTH,
  type WorkflowCanvasText,
} from "@/v2/core/workflow";

import {
  PROCUREMENT_WORKFLOW_CANVASES,
  PROCUREMENT_WORKFLOW_ORDER,
} from "./procurementWorkflow.canvases";
import {
  PROCUREMENT_WORKFLOW_EN,
  PROCUREMENT_WORKFLOW_VI,
} from "./procurementWorkflow.text.data";
import { PROCUREMENT_WORKFLOW_PREFIX } from "./procurementWorkflow.text";

const canvases = PROCUREMENT_WORKFLOW_ORDER.map(
  (id) => PROCUREMENT_WORKFLOW_CANVASES[id],
);

const collectTexts = (): WorkflowCanvasText[] =>
  canvases.flatMap((c) => [
    c.title,
    c.description,
    ...(c.corner ? [c.corner.title] : []),
    ...(c.flows ?? []).flatMap((f) => [f.title, f.description]),
    ...c.lanes.map((l) => l.title),
    ...c.columns.map((col) => col.title),
    ...c.nodes.flatMap((n) => [n.title, ...(n.badges ?? [])]),
    ...c.edges.flatMap((e) => (e.label ? [e.label] : [])),
  ]);

describe("procurement workflow canvases", () => {
  it("mọi canvas trong order đều tồn tại và id khớp", () => {
    canvases.forEach((c, i) => {
      expect(c).toBeDefined();
      expect(c.id).toBe(PROCUREMENT_WORKFLOW_ORDER[i]);
    });
  });

  it("mọi mũi tên nối hai thẻ có thật và id duy nhất", () => {
    canvases.forEach((c) => {
      const nodeIds = new Set(c.nodes.map((n) => n.id));
      expect(nodeIds.size).toBe(c.nodes.length);
      expect(new Set(c.edges.map((e) => e.id)).size).toBe(c.edges.length);
      c.edges.forEach((e) => {
        expect(nodeIds.has(e.source), `${c.id}:${e.id} source`).toBe(true);
        expect(nodeIds.has(e.target), `${c.id}:${e.id} target`).toBe(true);
      });
    });
  });

  it("mọi thẻ nằm trọn trong một lane (và một cột nếu canvas có cột)", () => {
    canvases.forEach((c) => {
      c.nodes.forEach((n) => {
        const inLane = c.lanes.some(
          (l) =>
            n.x >= l.x &&
            n.x + WORKFLOW_NODE_WIDTH <= l.x + l.width &&
            n.y >= l.y &&
            n.y + WORKFLOW_CARD_MIN_HEIGHT <= l.y + l.height,
        );
        expect(inLane, `${c.id}:${n.id} trong lane`).toBe(true);
        if (c.columns.length) {
          const inColumn = c.columns.some(
            (col) =>
              n.x >= col.x && n.x + WORKFLOW_NODE_WIDTH <= col.x + col.width,
          );
          expect(inColumn, `${c.id}:${n.id} trong cột`).toBe(true);
        }
      });
    });
  });

  it("mũi tên của luồng tham chiếu luồng đã khai báo", () => {
    canvases.forEach((c) => {
      const flowIds = new Set((c.flows ?? []).map((f) => f.id));
      c.edges.forEach((e) =>
        (e.flows ?? []).forEach((f) => expect(flowIds.has(f)).toBe(true)),
      );
    });
  });

  it("mọi khóa chữ có đủ bản VI và EN, cùng tập khóa", () => {
    expect(Object.keys(PROCUREMENT_WORKFLOW_EN).sort()).toEqual(
      Object.keys(PROCUREMENT_WORKFLOW_VI).sort(),
    );
    collectTexts().forEach((text) => {
      expect(text.key.startsWith(`${PROCUREMENT_WORKFLOW_PREFIX}.`)).toBe(true);
      const flat = text.key.slice(PROCUREMENT_WORKFLOW_PREFIX.length + 1);
      expect(PROCUREMENT_WORKFLOW_VI[flat], text.key).toBeTruthy();
      expect(PROCUREMENT_WORKFLOW_EN[flat], text.key).toBeTruthy();
    });
  });
});
