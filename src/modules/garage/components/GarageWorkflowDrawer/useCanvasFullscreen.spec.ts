import { describe, expect, it } from "vitest";

import { resolveFullscreenAction } from "./useCanvasFullscreen";

describe("resolveFullscreenAction", () => {
  const frame = document.createElement("div");
  const other = document.createElement("div");

  it("chưa có phần tử nào full screen thì bật cho khung này", () => {
    expect(resolveFullscreenAction(null, frame)).toBe("enter");
  });

  it("đang full screen chính khung này thì tắt", () => {
    expect(resolveFullscreenAction(frame, frame)).toBe("exit");
  });

  it("đang full screen phần tử khác thì bật cho khung này", () => {
    expect(resolveFullscreenAction(other, frame)).toBe("enter");
  });
});
