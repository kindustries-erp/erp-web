import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2MobileAppearanceDrawer } from "./V2MobileAppearanceDrawer";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_k: string, fallback?: string) => fallback ?? _k,
    locale: "vi",
  }),
}));

describe("V2MobileAppearanceDrawer Organism", () => {
  it("renders compact bottom sheet with appearance and language settings", () => {
    const handleThemeChange = vi.fn();
    render(
      <V2MobileAppearanceDrawer
        open={true}
        onOpenChange={vi.fn()}
        currentTheme="classic-light"
        onThemeChange={handleThemeChange}
      />,
    );

    const sheetContent = screen.getByTestId("v2-bottom-sheet-content");
    expect(sheetContent).toBeInTheDocument();
    expect(sheetContent.className).toContain("max-h-[70vh]");

    expect(screen.getByText("Giao diện & Ngôn ngữ")).toBeInTheDocument();
    expect(
      screen.getByText("Tùy chỉnh chủ đề màu sắc và ngôn ngữ hiển thị"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("mobile-appearance-settings"),
    ).toBeInTheDocument();
    expect(screen.getByText("Giao diện")).toBeInTheDocument();
    expect(screen.getByText("Ngôn ngữ")).toBeInTheDocument();

    // Click dark theme
    const darkBtn = screen.getByText("Tối");
    fireEvent.click(darkBtn);
    expect(handleThemeChange).toHaveBeenCalledWith("classic-dark");
  });
});
