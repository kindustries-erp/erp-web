import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { V2Loading } from "./V2Loading";
import { V2PageFallback } from "./V2PageFallback";
import {
  V2LoadingVariant,
  V2LoadingSize,
  V2LoadingTextPosition,
  type V2LoadingVariantType,
} from "./V2Loading.type";

const ALL_VARIANTS: V2LoadingVariantType[] = [
  V2LoadingVariant.SUPERCAR_ROAD,
  V2LoadingVariant.TAIL_SPIN,
  V2LoadingVariant.THREE_DOTS,
  V2LoadingVariant.PULSE_BARS,
  V2LoadingVariant.RINGS,
  V2LoadingVariant.ORBIT,
  V2LoadingVariant.GRID,
];

describe("V2Loading Atom", () => {
  it("renders with role='status' and default aria-label", () => {
    render(<V2Loading />);
    const el = screen.getByRole("status");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("aria-label", "Đang tải");
  });

  it.each(ALL_VARIANTS)("renders variant '%s' properly", (variant) => {
    const { container } = render(
      <V2Loading variant={variant} data-testid={`loading-${variant}`} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("supports string literal variant for backward compatibility", () => {
    const { container } = render(<V2Loading variant="supercar-road" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders text label and custom aria-label", () => {
    render(<V2Loading text="Đang tải trang..." />);
    expect(screen.getByText("Đang tải trang...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Đang tải trang...",
    );
  });

  it("applies horizontal flex layout when textPosition is right", () => {
    const { container } = render(
      <V2Loading text="Xử lý..." textPosition={V2LoadingTextPosition.RIGHT} />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("flex-row");
  });

  it("applies fullscreen fixed layout when fullscreen=true", () => {
    const { container } = render(<V2Loading fullscreen />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("fixed");
    expect(el.className).toContain("inset-0");
  });
});

describe("V2PageFallback Atom", () => {
  it("renders with default supercar-road indicator and i18n text", () => {
    render(<V2PageFallback />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Đang tải trang...")).toBeInTheDocument();
  });

  it("allows custom text override", () => {
    render(<V2PageFallback text="Đang khởi tạo ứng dụng..." />);
    expect(screen.getByText("Đang khởi tạo ứng dụng...")).toBeInTheDocument();
  });
});
