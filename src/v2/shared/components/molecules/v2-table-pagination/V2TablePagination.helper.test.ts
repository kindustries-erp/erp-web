import { describe, expect, it } from "vitest";
import { getPageWindow } from "./V2TablePagination.helper";

describe("getPageWindow", () => {
  it("shows the first five pages and the last page with a gap", () => {
    expect(getPageWindow(1, 10)).toEqual({
      start: 1,
      end: 5,
      showFirst: false,
      showFirstGap: false,
      showLast: true,
      showLastGap: true,
    });
  });

  it("centers the window and shows both ends with gaps", () => {
    expect(getPageWindow(5, 10)).toEqual({
      start: 3,
      end: 7,
      showFirst: true,
      showFirstGap: true,
      showLast: true,
      showLastGap: true,
    });
  });

  it("keeps a full window at the last pages", () => {
    expect(getPageWindow(10, 10)).toMatchObject({
      start: 6,
      end: 10,
      showFirst: true,
      showFirstGap: true,
      showLast: false,
    });
  });

  it("omits the gap when the first or last page is adjacent", () => {
    expect(getPageWindow(2, 7)).toMatchObject({
      start: 1,
      end: 5,
      showLast: true,
      showLastGap: true,
    });
    expect(getPageWindow(4, 7)).toMatchObject({
      start: 2,
      end: 6,
      showFirst: true,
      showFirstGap: false,
      showLast: true,
      showLastGap: false,
    });
  });

  it("shows every page when there are few", () => {
    expect(getPageWindow(2, 3)).toEqual({
      start: 1,
      end: 3,
      showFirst: false,
      showFirstGap: false,
      showLast: false,
      showLastGap: false,
    });
  });

  it("clamps out of range pages and handles zero pages", () => {
    expect(getPageWindow(99, 4)).toMatchObject({ start: 1, end: 4 });
    expect(getPageWindow(-3, 4)).toMatchObject({ start: 1, end: 4 });
    const none = getPageWindow(1, 0);
    expect(none.end).toBeLessThan(none.start);
    expect(none.showFirst || none.showLast).toBe(false);
  });
});
