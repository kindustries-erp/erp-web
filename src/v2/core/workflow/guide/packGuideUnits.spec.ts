import { describe, expect, it } from "vitest";

import { packGuideUnits } from "./packGuideUnits";

describe("packGuideUnits", () => {
  it("xếp đủ đơn vị vào một trang khi chưa tràn", () => {
    expect(packGuideUnits([100, 100, 100], [false, false, false], 400)).toEqual(
      [[0, 1, 2]],
    );
  });

  it("sang trang mới khi đơn vị tiếp theo không còn vừa, không cắt đôi đơn vị", () => {
    expect(packGuideUnits([300, 300, 300], [false, false, false], 700)).toEqual(
      [[0, 1], [2]],
    );
  });

  it("tiêu đề (keepWithNext) không đứng cuối trang mà đi cùng đơn vị sau", () => {
    const pages = packGuideUnits([300, 60, 200], [false, true, false], 400);

    expect(pages).toEqual([[0], [1, 2]]);
  });

  it("nhiều tiêu đề liên tiếp đi cùng đơn vị đầu tiên không phải tiêu đề", () => {
    const pages = packGuideUnits(
      [300, 50, 50, 100],
      [false, true, true, false],
      420,
    );

    expect(pages).toEqual([[0], [1, 2, 3]]);
  });

  it("đơn vị cao hơn một trang vẫn được xếp riêng", () => {
    const pages = packGuideUnits([100, 900, 100], [false, false, false], 500);

    expect(pages).toEqual([[0], [1], [2]]);
  });

  it("mọi đơn vị đều xuất hiện đúng một lần theo đúng thứ tự", () => {
    const heights = [120, 80, 200, 40, 300, 90, 60, 250];
    const keep = [true, false, false, true, false, false, true, false];
    const flat = packGuideUnits(heights, keep, 450).flat();

    expect(flat).toEqual(heights.map((_, index) => index));
  });

  it("không có đơn vị nào thì không có trang", () => {
    expect(packGuideUnits([], [], 400)).toEqual([]);
  });
});
