import { describe, expect, it } from "vitest";

import { GARAGE_WORKFLOW_CANVASES } from "./garageWorkflowData";
import { canvasBounds, WORKFLOW_HEADING_HEIGHT } from "./canvasBounds";

describe("canvasBounds", () => {
  it("không có tiêu đề thì khung bao phủ lane và cột", () => {
    const canvas = GARAGE_WORKFLOW_CANVASES["end-user"];
    const bounds = canvasBounds(canvas);

    canvas.lanes.forEach((lane) => {
      expect(lane.x).toBeGreaterThanOrEqual(bounds.x);
      expect(lane.y).toBeGreaterThanOrEqual(bounds.y);
      expect(lane.x + lane.width).toBeLessThanOrEqual(bounds.x + bounds.width);
      expect(lane.y + lane.height).toBeLessThanOrEqual(
        bounds.y + bounds.height,
      );
    });
  });

  it("withHeading cộng đúng chiều cao khối tiêu đề lên phía trên", () => {
    const canvas = GARAGE_WORKFLOW_CANVASES.dev;
    const plain = canvasBounds(canvas);
    const withHeading = canvasBounds(canvas, { withHeading: true });

    expect(withHeading.y).toBe(plain.y - WORKFLOW_HEADING_HEIGHT);
    expect(withHeading.height).toBe(plain.height + WORKFLOW_HEADING_HEIGHT);
    expect(withHeading.width).toBe(plain.width);
  });
});

describe("canvasBounds với lớp chỉ đọc", () => {
  it("không tính cột lớp đọc khi tắt, có tính khi bật", () => {
    const canvas = {
      ...GARAGE_WORKFLOW_CANVASES.dev,
      lanes: [],
      columns: [
        {
          id: "main",
          title: { key: "workflow.x", fallback: "x" },
          x: 0,
          y: 0,
          width: 300,
          height: 400,
        },
        {
          id: "read",
          title: { key: "workflow.y", fallback: "y" },
          x: 400,
          y: 0,
          width: 300,
          height: 400,
          layer: "read" as const,
        },
      ],
    };

    expect(canvasBounds(canvas).width).toBeLessThan(
      canvasBounds(canvas, { showRead: true }).width,
    );
    expect(canvasBounds(canvas, { showRead: true }).width).toBe(700 + 48);
  });
});
