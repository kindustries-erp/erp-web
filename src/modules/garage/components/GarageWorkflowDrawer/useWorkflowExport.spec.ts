import { describe, expect, it } from "vitest";

import {
  buildWorkflowFileName,
  fitImageToPage,
  unionBounds,
} from "./useWorkflowExport";

describe("buildWorkflowFileName", () => {
  it("ghép id canvas và ngày YYYYMMDD với số 0 đệm", () => {
    expect(buildWorkflowFileName("end-user", new Date(2026, 0, 5))).toBe(
      "garage-workflow-end-user-20260105",
    );
  });
});

describe("unionBounds", () => {
  it("lấy khung bao các hình chữ nhật và cộng padding", () => {
    const bounds = unionBounds(
      [
        { x: 10, y: 20, width: 100, height: 50 },
        { x: 200, y: 0, width: 50, height: 80 },
      ],
      10,
    );

    expect(bounds).toEqual({ x: 0, y: -10, width: 260, height: 100 });
  });

  it("không có hình nào thì trả khung rỗng", () => {
    expect(unionBounds([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});

describe("fitImageToPage", () => {
  it("ảnh ngang dùng A3 ngang và căn giữa trong lề", () => {
    const fitted = fitImageToPage(1000, 500, 10);

    expect(fitted.orientation).toBe("landscape");
    expect(fitted.pageWidth).toBe(420);
    expect(fitted.pageHeight).toBe(297);
    expect(fitted.width).toBeCloseTo(400);
    expect(fitted.height).toBeCloseTo(200);
    expect(fitted.x).toBeCloseTo(10);
    expect(fitted.y).toBeCloseTo(48.5);
  });

  it("ảnh dọc dùng A3 dọc và giới hạn theo chiều cao", () => {
    const fitted = fitImageToPage(500, 1000, 10);

    expect(fitted.orientation).toBe("portrait");
    expect(fitted.pageWidth).toBe(297);
    expect(fitted.pageHeight).toBe(420);
    expect(fitted.height).toBeCloseTo(400);
    expect(fitted.width).toBeCloseTo(200);
    expect(fitted.x + fitted.width / 2).toBeCloseTo(148.5);
  });
});
