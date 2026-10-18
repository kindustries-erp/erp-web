import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2Stack } from "./V2Stack";

describe("V2Stack", () => {
  it("renders a flex column with min-h-0 by default", () => {
    render(<V2Stack data-testid="stack">x</V2Stack>);

    const stack = screen.getByTestId("stack");
    expect(stack.tagName).toBe("DIV");
    expect(stack).toHaveClass("flex", "flex-col", "min-h-0");
  });

  it("applies gap, fill and grow variants", () => {
    render(
      <V2Stack data-testid="stack" gap="md" fill grow>
        x
      </V2Stack>,
    );

    const stack = screen.getByTestId("stack");
    expect(stack).toHaveClass("gap-4", "h-full", "w-full", "flex-1");
  });

  it("renders as a section when as='section'", () => {
    render(
      <V2Stack as="section" data-testid="stack">
        x
      </V2Stack>,
    );

    expect(screen.getByTestId("stack").tagName).toBe("SECTION");
  });

  it("merges a custom className", () => {
    render(
      <V2Stack data-testid="stack" className="custom-x">
        x
      </V2Stack>,
    );

    expect(screen.getByTestId("stack")).toHaveClass("custom-x");
  });
});
