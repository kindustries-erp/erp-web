import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { V2MobileCatalogDrawer } from "./V2MobileCatalogDrawer";
import type { V2MobileCatalogDrawerProps } from "./V2MobileCatalogDrawer.type";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_k: string, fallback?: string | { defaultValue?: string }) => {
      if (typeof fallback === "object" && fallback?.defaultValue) {
        return fallback.defaultValue;
      }
      return typeof fallback === "string" ? fallback : _k;
    },
    locale: "vi",
  }),
}));

const defaultProps: V2MobileCatalogDrawerProps = {
  open: true,
  onOpenChange: vi.fn(),
  totalModulesCount: 10,
  filteredSectionsCount: 2,
  searchQuery: "",
  onSearchChange: vi.fn(),
  isCustomizing: false,
  limitWarning: null,
  currentCount: 4,
  maxCount: 7,
  onStartCustomize: vi.fn(),
  onFinishCustomize: vi.fn(),
  onResetDefault: vi.fn(),
  sections: [],
  selectedIds: [],
  activeNavId: "dashboard",
  onItemClick: vi.fn(),
};

describe("V2MobileCatalogDrawer Organism", () => {
  it("renders catalog bottom sheet with full screen height (h-[100dvh]) and without appearance settings", () => {
    render(<V2MobileCatalogDrawer {...defaultProps} />);

    const sheetContent = screen.getByTestId("v2-bottom-sheet-content");
    expect(sheetContent).toBeDefined();
    expect(sheetContent.className).toContain("h-[100dvh]");
    expect(sheetContent.className).toContain("max-h-[100dvh]");

    expect(
      screen.queryByTestId("mobile-appearance-settings"),
    ).not.toBeInTheDocument();
  });
});
