import { describe, expect, it } from "vitest";

import {
  canvasHeaderRects,
  COLUMN_HEADER_HEIGHT,
  LANE_HEADER_LEFT,
  LANE_HEADER_TOP,
  resolveLaneHeaderSide,
} from "./canvasHeaderRects";
import { GARAGE_WORKFLOW_CANVASES } from "./garageWorkflowData";

describe("resolveLaneHeaderSide", () => {
  it("ưu tiên headerSide khai báo, nếu không thì lane rất rộng dùng tiêu đề bên trái", () => {
    expect(
      resolveLaneHeaderSide({ width: 100, height: 100, headerSide: "left" }),
    ).toBe("left");
    expect(resolveLaneHeaderSide({ width: 1700, height: 170 })).toBe("left");
    expect(resolveLaneHeaderSide({ width: 400, height: 400 })).toBe("top");
  });
});

describe("canvasHeaderRects", () => {
  it("dev: mỗi khung chính có một thanh tiêu đề phía trên, dải lớp đọc ẩn khi tắt", () => {
    const dev = GARAGE_WORKFLOW_CANVASES.dev;
    const hidden = canvasHeaderRects(dev);
    const shown = canvasHeaderRects(dev, { showRead: true });

    expect(hidden).toHaveLength(4);
    expect(shown).toHaveLength(5);
    hidden.forEach((rect) => expect(rect.height).toBe(LANE_HEADER_TOP));
  });

  it("end-user: tiêu đề hàng nằm bên trái, có đầu cột và ô góc", () => {
    const endUser = GARAGE_WORKFLOW_CANVASES["end-user"];
    const rects = canvasHeaderRects(endUser);

    expect(rects).toHaveLength(
      endUser.lanes.length + endUser.columns.length + 1,
    );
    expect(
      rects.filter((rect) => rect.width === LANE_HEADER_LEFT),
    ).toHaveLength(endUser.lanes.length + 1);
    expect(
      rects.filter((rect) => rect.height === COLUMN_HEADER_HEIGHT),
    ).toHaveLength(endUser.columns.length);
  });
});
