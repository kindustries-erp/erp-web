import { describe, it, expect, beforeEach, vi } from "vitest";
import { applyV2Theme, V2_THEMES } from "./v2ThemeHelper";

describe("v2ThemeHelper", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    vi.restoreAllMocks();
  });

  it("should have 5 predefined themes matching ERP", () => {
    expect(V2_THEMES).toHaveLength(5);
    expect(V2_THEMES.map((t) => t.id)).toEqual([
      "default",
      "classic-light",
      "classic-dark",
      "orcaq",
      "midnight",
    ]);
  });

  it("should apply default theme by clearing other theme classes and removing dark", () => {
    document.documentElement.classList.add(
      "theme-midnight",
      "theme-classic",
      "theme-classic-dark",
      "dark",
    );
    applyV2Theme("default");
    expect(document.documentElement.classList.contains("theme-classic")).toBe(
      false,
    );
    expect(
      document.documentElement.classList.contains("theme-classic-dark"),
    ).toBe(false);
    expect(document.documentElement.classList.contains("theme-orcaq")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should apply classic-light theme with theme-classic and without dark", () => {
    applyV2Theme("classic-light");
    expect(document.documentElement.classList.contains("theme-classic")).toBe(
      true,
    );
    expect(
      document.documentElement.classList.contains("theme-classic-dark"),
    ).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(
      false,
    );
  });

  it("should apply classic-dark theme with theme-classic, theme-classic-dark, and dark", () => {
    applyV2Theme("classic-dark");
    expect(document.documentElement.classList.contains("theme-classic")).toBe(
      true,
    );
    expect(
      document.documentElement.classList.contains("theme-classic-dark"),
    ).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(
      false,
    );
  });

  it("should apply orcaq theme without dark class", () => {
    applyV2Theme("orcaq");
    expect(document.documentElement.classList.contains("theme-orcaq")).toBe(
      true,
    );
    expect(document.documentElement.classList.contains("theme-classic")).toBe(
      false,
    );
    expect(
      document.documentElement.classList.contains("theme-classic-dark"),
    ).toBe(false);
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(
      false,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
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
    expect(
      document.documentElement.classList.contains("theme-classic-dark"),
    ).toBe(false);
    expect(document.documentElement.classList.contains("theme-orcaq")).toBe(
      false,
    );
  });

  it("should respect explicit light theme even if OS is in dark mode (preventing dark mode override bug)", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes("prefers-color-scheme: dark"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // User selects Default Light
    applyV2Theme("default");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // User selects Classic Light
    applyV2Theme("classic-light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("theme-classic")).toBe(
      true,
    );
    expect(
      document.documentElement.classList.contains("theme-classic-dark"),
    ).toBe(false);

    // User selects Classic (system-auto mode)
    applyV2Theme("classic");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(
      document.documentElement.classList.contains("theme-classic-dark"),
    ).toBe(true);
  });
});
