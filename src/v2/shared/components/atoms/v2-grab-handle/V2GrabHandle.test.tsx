import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2GrabHandle } from "./V2GrabHandle";

describe("V2GrabHandle", () => {
  it("renders a decorative, hidden-from-a11y pill", () => {
    render(<V2GrabHandle data-testid="grab" />);

    const handle = screen.getByTestId("grab");
    expect(handle).toHaveAttribute("aria-hidden", "true");
    expect(handle).toHaveClass("rounded-full", "w-10", "h-1");
  });
});
