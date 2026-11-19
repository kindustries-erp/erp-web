import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2Image } from "./V2Image";

describe("V2Image", () => {
  it("renders image with src and alt attributes", () => {
    render(<V2Image src="https://example.com/logo.png" alt="Company Logo" />);
    const img = screen.getByTestId("v2-image") as HTMLImageElement;
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("https://example.com/logo.png");
    expect(img.getAttribute("alt")).toBe("Company Logo");
    expect(img.getAttribute("loading")).toBe("lazy");
  });

  it("renders fallbackIcon when image encounters error", () => {
    render(
      <V2Image
        src="https://example.com/invalid.png"
        alt="Invalid Logo"
        fallbackIcon={<span data-testid="custom-fallback">N/A</span>}
      />,
    );
    const img = screen.getByTestId("v2-image");
    fireEvent.error(img);

    expect(screen.getByTestId("v2-image-fallback-icon")).toBeDefined();
    expect(screen.getByTestId("custom-fallback")).toBeDefined();
  });

  it("switches to fallbackSrc when image encounters error", () => {
    render(
      <V2Image
        src="https://example.com/invalid.png"
        alt="Logo"
        fallbackSrc="https://example.com/fallback.png"
      />,
    );
    const img = screen.getByTestId("v2-image") as HTMLImageElement;
    fireEvent.error(img);

    expect(img.getAttribute("src")).toBe("https://example.com/fallback.png");
  });
});
