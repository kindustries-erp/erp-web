import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2AlertBanner } from "./V2AlertBanner";

describe("V2AlertBanner", () => {
  it("announces the error message with an alert role", () => {
    render(<V2AlertBanner>Không thể tải dữ liệu</V2AlertBanner>);

    const banner = screen.getByRole("alert");
    expect(banner).toHaveTextContent("Không thể tải dữ liệu");
    expect(banner).toHaveClass("text-destructive", "bg-destructive/10");
  });
});
