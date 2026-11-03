import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2AdminLayout } from "./V2AdminLayout";

describe("V2AdminLayout Platform Split", () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("renders Desktop layout when innerWidth >= 1024", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });

    render(
      <V2AdminLayout>
        <div>Admin Desktop View</div>
      </V2AdminLayout>,
    );

    expect(screen.getByTestId("v2-admin-layout-desktop")).toBeDefined();
    expect(screen.getByText("Admin Desktop View")).toBeDefined();
  });

  it("renders Mobile layout when innerWidth < 768", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 390,
    });

    render(
      <V2AdminLayout>
        <div>Admin Mobile View</div>
      </V2AdminLayout>,
    );

    expect(screen.getByTestId("v2-admin-layout-mobile")).toBeDefined();
    expect(screen.getByText("Admin Mobile View")).toBeDefined();
  });
});
