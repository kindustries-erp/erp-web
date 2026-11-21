import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import { V2Skeleton } from "./V2Skeleton";

describe("V2Skeleton Atom", () => {
  it("renders with aria-hidden and animate-pulse", () => {
    const { container } = render(<V2Skeleton data-testid="skeleton" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el.className).toContain("animate-pulse");
    expect(el.className).toContain(
      "bg-[color:color-mix(in_srgb,var(--muted-fg)_16%,transparent)]",
    );
  });

  it("merges custom className properly", () => {
    const { container } = render(
      <V2Skeleton className="h-6 w-24 custom-test" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("h-6");
    expect(el.className).toContain("w-24");
    expect(el.className).toContain("custom-test");
  });
});
