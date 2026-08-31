import { describe, expect, it } from "vitest";
import { pageToPath, pathToPage } from "./pageUrl";

describe("pageUrl with report dashboards", () => {
  it("serializes sales report dashboard path", () => {
    expect(pageToPath("sales-report-dashboard")).toBe(
      "/sales-report-dashboard",
    );
  });

  it("serializes purchasing report dashboard path", () => {
    expect(pageToPath("purchasing-report-dashboard")).toBe(
      "/purchasing-report-dashboard",
    );
  });

  it("parses sales report dashboard from pathname", () => {
    expect(pathToPage("/sales-report-dashboard", "")).toEqual({
      page: "sales-report-dashboard",
      tab: undefined,
      instanceIndex: 1,
      searchParams: expect.any(URLSearchParams),
    });
  });

  it("parses purchasing report dashboard from pathname", () => {
    expect(pathToPage("/purchasing-report-dashboard", "")).toEqual({
      page: "purchasing-report-dashboard",
      tab: undefined,
      instanceIndex: 1,
      searchParams: expect.any(URLSearchParams),
    });
  });

  it("serializes and parses /opex correctly", () => {
    expect(pageToPath("opex")).toBe("/opex");
    expect(pathToPage("/opex", "")).toEqual({
      page: "opex",
      tab: undefined,
      instanceIndex: 1,
      searchParams: expect.any(URLSearchParams),
    });
  });

  it("returns null (404) when accessing deprecated /budget path", () => {
    expect(pathToPage("/budget", "")).toBeNull();
  });
});
