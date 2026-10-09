import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { V2Skeleton } from "./V2Skeleton";

describe("V2Skeleton", () => {
  it("renders a hidden pulsing block with custom size classes", () => {
    const { container } = render(<V2Skeleton className="h-4 w-32" />);
    const block = container.firstElementChild as HTMLElement;
    expect(block).toHaveAttribute("aria-hidden", "true");
    expect(block).toHaveClass("animate-pulse", "h-4", "w-32");
  });
});
