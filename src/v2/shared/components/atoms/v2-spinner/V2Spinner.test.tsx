import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2Spinner } from "./V2Spinner";

describe("V2Spinner", () => {
  it("is announced as a status with the given label and spins", () => {
    render(<V2Spinner aria-label="Đang tải" />);

    const spinner = screen.getByRole("status", { name: "Đang tải" });
    expect(spinner).toHaveClass("animate-spin", "w-7", "h-7");
  });

  it("uses the small size when size='sm'", () => {
    render(<V2Spinner aria-label="Đang tải" size="sm" />);

    expect(screen.getByRole("status", { name: "Đang tải" })).toHaveClass(
      "w-4",
      "h-4",
    );
  });
});
