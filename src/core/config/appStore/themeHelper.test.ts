import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  applyDocumentTheme,
  registerThemeChangeCallback,
  initSystemThemeSync,
} from "./themeHelper";

describe("themeHelper", () => {
  beforeEach(() => {
    document.documentElement.className = "";
  });

  it("applies Light Classic correctly", () => {
    applyDocumentTheme("classic-light");
    const cl = document.documentElement.classList;
    expect(cl.contains("theme-classic")).toBe(true);
    expect(cl.contains("theme-classic-dark")).toBe(false);
    expect(cl.contains("dark")).toBe(false);
  });

  it("applies Dark Classic correctly", () => {
    applyDocumentTheme("classic-dark");
    const cl = document.documentElement.classList;
    expect(cl.contains("theme-classic")).toBe(true);
    expect(cl.contains("theme-classic-dark")).toBe(true);
    expect(cl.contains("dark")).toBe(true);
  });

  it("applies Midnight as an independent theme", () => {
    applyDocumentTheme("midnight");
    const cl = document.documentElement.classList;
    expect(cl.contains("theme-midnight")).toBe(true);
    expect(cl.contains("dark")).toBe(true);
    expect(cl.contains("theme-classic")).toBe(false);
    expect(cl.contains("theme-classic-dark")).toBe(false);
  });

  it("notifies callback when system dark mode changes for classic family", () => {
    const callback = vi.fn();
    const unregister = registerThemeChangeCallback(callback);

    let mediaListener: ((e: any) => void) | null = null;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_type, listener) => {
        mediaListener = listener;
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    initSystemThemeSync();
    applyDocumentTheme("classic-light");

    if (mediaListener) {
      (mediaListener as any)({ matches: true });
      expect(callback).toHaveBeenCalledWith("classic-dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      (mediaListener as any)({ matches: false });
      expect(callback).toHaveBeenCalledWith("classic-light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    }

    unregister();
  });
});
