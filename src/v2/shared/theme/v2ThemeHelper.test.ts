import { describe, it, expect, beforeEach } from "vitest";
import { applyV2Theme, V2_THEMES } from "./v2ThemeHelper";

describe("v2ThemeHelper", () => {
  beforeEach(() => {
    document.documentElement.className = "";
  });

  it("should have 4 predefined themes", () => {
    expect(V2_THEMES).toHaveLength(4);
    expect(V2_THEMES.map((t) => t.id)).toEqual([
      "default",
      "classic",
      "orcaq",
      "midnight",
    ]);
  });

  it("should apply default theme by clearing other theme classes", () => {
    document.documentElement.classList.add("theme-midnight", "dark");
    applyV2Theme("default");
    expect(document.documentElement.classList.contains("theme-classic")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("theme-orcaq")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should apply classic theme", () => {
    applyV2Theme("classic");
    expect(document.documentElement.classList.contains("theme-classic")).toBe(
      true,
    );
    expect(document.documentElement.classList.contains("theme-orcaq")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(
      false,
    );
  });

  it("should apply orcaq theme", () => {
    applyV2Theme("orcaq");
    expect(document.documentElement.classList.contains("theme-orcaq")).toBe(
      true,
    );
    expect(document.documentElement.classList.contains("theme-classic")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(
      false,
    );
  });

  it("should apply midnight theme with dark class", () => {
    applyV2Theme("midnight");
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(
      true,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("theme-classic")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("theme-orcaq")).toBe(
      false,
    );
  });
});
