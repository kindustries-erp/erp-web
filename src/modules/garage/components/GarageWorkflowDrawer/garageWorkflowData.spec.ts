import { describe, expect, it } from "vitest";

import {
  GARAGE_STATUS_CODES,
  GARAGE_WORKFLOW_CANVASES,
  GARAGE_WORKFLOW_CANVAS_ORDER,
} from "./garageWorkflowData";
import {
  WORKFLOW_CARD_MIN_HEIGHT,
  WORKFLOW_NODE_WIDTH,
  type GarageWorkflowCanvasDefinition,
  type GarageWorkflowRect,
} from "./garageWorkflowTypes";

const canvases = GARAGE_WORKFLOW_CANVAS_ORDER.map(
  (id) => GARAGE_WORKFLOW_CANVASES[id],
);

/** Chiều cao xấp xỉ của thẻ: tiêu đề + mỗi badge một dòng. */
const estimateHeight = (badgeCount: number) =>
  Math.max(WORKFLOW_CARD_MIN_HEIGHT, 56 + badgeCount * 18);

const contains = (outer: GarageWorkflowRect, x: number, y: number) =>
  x >= outer.x &&
  y >= outer.y &&
  x < outer.x + outer.width &&
  y < outer.y + outer.height;

const overlaps = (a: GarageWorkflowRect, b: GarageWorkflowRect) =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

describe("garageWorkflowData", () => {
  it("khai báo đúng 2 canvas: end-user trước, dev sau", () => {
    expect(GARAGE_WORKFLOW_CANVAS_ORDER).toEqual(["end-user", "dev"]);
    canvases.forEach((canvas) => expect(canvas.id).toBeDefined());
  });

  it.each(canvases.map((canvas) => [canvas.id, canvas] as const))(
    "canvas %s: id lane, cột, node không trùng và edge trỏ tới node có thật",
    (_id, canvas: GarageWorkflowCanvasDefinition) => {
      const nodeIds = canvas.nodes.map((node) => node.id);
      expect(new Set(nodeIds).size).toBe(nodeIds.length);

      const laneIds = canvas.lanes.map((lane) => lane.id);
      expect(new Set(laneIds).size).toBe(laneIds.length);

      canvas.edges.forEach((edge) => {
        expect(nodeIds).toContain(edge.source);
        expect(nodeIds).toContain(edge.target);
      });
    },
  );

  it.each(canvases.map((canvas) => [canvas.id, canvas] as const))(
    "canvas %s: mọi text có key thuộc namespace workflow",
    (_id, canvas: GarageWorkflowCanvasDefinition) => {
      const texts = [
        canvas.title,
        ...canvas.lanes.map((lane) => lane.title),
        ...canvas.columns.map((column) => column.title),
        ...canvas.nodes.flatMap((node) => [node.title, ...(node.badges ?? [])]),
        ...canvas.edges.flatMap((edge) => (edge.label ? [edge.label] : [])),
      ];

      texts.forEach((text) => {
        expect(text.key.startsWith("workflow.")).toBe(true);
        expect(text.fallback.trim().length).toBeGreaterThan(0);
      });
    },
  );

  it.each(canvases.map((canvas) => [canvas.id, canvas] as const))(
    "canvas %s: node nằm trong ít nhất một lane hoặc cột và không chồng lên node khác",
    (_id, canvas: GarageWorkflowCanvasDefinition) => {
      const boxes = canvas.nodes.map((node) => ({
        id: node.id,
        x: node.x,
        y: node.y,
        width: WORKFLOW_NODE_WIDTH,
        height: estimateHeight(node.badges?.length ?? 0),
      }));

      boxes.forEach((box) => {
        const inside = [...canvas.lanes, ...canvas.columns].some((area) =>
          contains(area, box.x + 1, box.y + 1),
        );
        expect(inside, box.id).toBe(true);
      });

      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          expect(
            overlaps(boxes[i], boxes[j]),
            `${boxes[i].id} chồng ${boxes[j].id}`,
          ).toBe(false);
        }
      }
    },
  );

  it("end-user là lưới 6 hàng bộ phận × 5 cột giai đoạn", () => {
    const endUser = GARAGE_WORKFLOW_CANVASES["end-user"];
    expect(endUser.lanes).toHaveLength(6);
    expect(endUser.columns).toHaveLength(5);
    endUser.lanes.forEach((lane) =>
      expect(lane.width).toBeGreaterThan(lane.height),
    );
  });

  it("dev là cây phân tầng 5 cột, không còn lane, cột cuối là lớp chỉ đọc", () => {
    const dev = GARAGE_WORKFLOW_CANVASES.dev;
    expect(dev.lanes).toHaveLength(0);
    expect(dev.columns.map((column) => column.id)).toEqual([
      "trigger",
      "service",
      "hub",
      "data",
      "read",
    ]);
    expect(
      dev.columns
        .filter((column) => column.layer === "read")
        .map((column) => column.id),
    ).toEqual(["read"]);
  });

  it("dev: mọi thẻ lớp đọc nằm trong cột đọc, mũi tên đọc chỉ nối với thẻ lớp đọc hoặc bảng dữ liệu", () => {
    const dev = GARAGE_WORKFLOW_CANVASES.dev;
    const readColumn = dev.columns.find((column) => column.id === "read")!;
    const byId = new Map(dev.nodes.map((node) => [node.id, node]));

    dev.nodes
      .filter((node) => node.layer === "read" && node.id !== "ledger")
      .forEach((node) =>
        expect(contains(readColumn, node.x + 1, node.y + 1), node.id).toBe(
          true,
        ),
      );

    dev.edges
      .filter((edge) => edge.kind === "read")
      .forEach((edge) => {
        const ends = [byId.get(edge.source)!, byId.get(edge.target)!];
        expect(
          ends.some((node) => node.layer === "read"),
          edge.id,
        ).toBe(true);
      });
  });

  it.each(canvases.map((canvas) => [canvas.id, canvas] as const))(
    "canvas %s: có description và số thứ tự (step) liên tục từ 1",
    (_id, canvas: GarageWorkflowCanvasDefinition) => {
      expect(canvas.description.key.startsWith("workflow.")).toBe(true);

      const steps =
        canvas.id === "dev"
          ? canvas.edges.map((edge) => edge.step)
          : canvas.nodes.map((node) => node.step);
      const defined = steps
        .filter((step): step is number => step !== undefined)
        .sort((a, b) => a - b);
      expect(defined).toEqual(defined.map((_, index) => index + 1));
    },
  );

  it("chỉ gắn statusCode cho mã đã xác minh trong code", () => {
    const verified = new Set<number>([
      GARAGE_STATUS_CODES.COMPLETED,
      GARAGE_STATUS_CODES.CANCELLED,
    ]);

    canvases.forEach((canvas) => {
      canvas.nodes.forEach((node) => {
        if (node.statusCode !== undefined) {
          expect(verified.has(node.statusCode)).toBe(true);
        }
      });
    });
  });
});
