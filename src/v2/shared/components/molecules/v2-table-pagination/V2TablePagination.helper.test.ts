import { describe, expect, it } from "vitest";
import {
  buildPageChunks,
  findChunkIndexForPage,
  getPageWindow,
  resolveChunkSize,
} from "./V2TablePagination.helper";

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

describe("buildPageChunks & findChunkIndexForPage", () => {
  it("resolves chunk size thresholds cleanly", () => {
    expect(resolveChunkSize(100)).toBe(20);
    expect(resolveChunkSize(400)).toBe(20);
    expect(resolveChunkSize(500)).toBe(50);
    expect(resolveChunkSize(1000)).toBe(50);
    expect(resolveChunkSize(1500)).toBe(100);
  });

  it("splits 100 pages into 5 chunks of 20", () => {
    const chunks = buildPageChunks(100);
    expect(chunks).toHaveLength(5);
    expect(chunks[0]).toEqual({ start: 1, end: 20, label: "1–20" });
    expect(chunks[2]).toEqual({ start: 41, end: 60, label: "41–60" });
    expect(chunks[4]).toEqual({ start: 81, end: 100, label: "81–100" });
  });

  it("handles trailing single-page chunk and zero pages", () => {
    const chunks = buildPageChunks(21);
    expect(chunks).toHaveLength(2);
    expect(chunks[1]).toEqual({ start: 21, end: 21, label: "21" });
    expect(buildPageChunks(0)).toEqual([]);
  });

  it("finds active chunk index for current page", () => {
    const chunks = buildPageChunks(100);
    expect(findChunkIndexForPage(chunks, 1)).toBe(0);
    expect(findChunkIndexForPage(chunks, 50)).toBe(2);
    expect(findChunkIndexForPage(chunks, 85)).toBe(4);
    expect(findChunkIndexForPage(chunks, 999)).toBe(0);
    expect(findChunkIndexForPage([], 1)).toBe(0);
  });
});
