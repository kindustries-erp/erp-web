import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2Progress } from "./V2Progress";

describe("V2Progress", () => {
  it("shows label and percentage", () => {
    render(<V2Progress value={42.4} label="Xuất Excel" showValue />);
    expect(screen.getByText("Xuất Excel")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "42",
    );
  });

  it("clamps the value to 0–100", () => {
    render(<V2Progress value={180} showValue />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("is indeterminate when the value is unknown", () => {
    const { container } = render(<V2Progress label="Đang xử lý" showValue />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("applies the tone colour", () => {
    const { container } = render(<V2Progress value={50} tone="emerald" />);
    expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  });
});
