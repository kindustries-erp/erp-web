import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2TypingIndicator } from "./V2TypingIndicator";

describe("V2TypingIndicator", () => {
  it("là vùng status có nhãn và ba chấm ẩn với trình đọc màn hình", () => {
    render(<V2TypingIndicator label="Đang đọc hóa đơn" />);
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Đang đọc hóa đơn");
    expect(status.querySelectorAll("[aria-hidden] > span")).toHaveLength(3);
  });
});
