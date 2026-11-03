import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2LoginPage } from "./V2LoginPage";
import * as viewportHook from "@/v2/shared/hooks/useViewport";

vi.mock("./V2LoginPage.desktop", () => ({
  V2LoginPageDesktop: () => <div data-testid="desktop-view">Desktop View</div>,
}));

vi.mock("./V2LoginPage.mobile", () => ({
  V2LoginPageMobile: () => <div data-testid="mobile-view">Mobile View</div>,
}));

describe("V2LoginPage Switcher", () => {
  it("renders desktop view when isMobile is false", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      width: 1200,
      height: 800,
    });

    render(<V2LoginPage />);
    expect(screen.getByTestId("desktop-view")).toBeInTheDocument();
    expect(screen.queryByTestId("mobile-view")).not.toBeInTheDocument();
  });

  it("renders mobile view when isMobile is true", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      width: 375,
      height: 667,
    });

    render(<V2LoginPage />);
    expect(screen.getByTestId("mobile-view")).toBeInTheDocument();
    expect(screen.queryByTestId("desktop-view")).not.toBeInTheDocument();
  });
});
