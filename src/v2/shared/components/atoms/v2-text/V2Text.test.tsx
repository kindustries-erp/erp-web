import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { V2Text } from "./V2Text";

describe("V2Text Atom", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it("renders with default props as paragraph", () => {
    render(<V2Text>Văn bản mô tả</V2Text>);
    const el = screen.getByText("Văn bản mô tả");
    expect(el).toBeInTheDocument();
    expect(el.tagName.toLowerCase()).toBe("p");
  });

  it("applies truncate class when truncate=true", () => {
    render(<V2Text truncate>Văn bản dài cắt ngắn</V2Text>);
    const el = screen.getByText("Văn bản dài cắt ngắn");
    expect(el).toHaveClass("truncate");
  });

  it("applies line-clamp-2 when truncate=2", () => {
    render(<V2Text truncate={2}>Nhiều dòng nội dung</V2Text>);
    const el = screen.getByText("Nhiều dòng nội dung");
    expect(el).toHaveClass("line-clamp-2");
  });

  it("renders red asterisk when required=true", () => {
    render(<V2Text required>Họ và tên</V2Text>);
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass("text-destructive");
  });

  it("handles copyable text click and copies to clipboard", async () => {
    render(<V2Text copyable>Mã đơn hàng: SO-12345</V2Text>);
    const el = screen.getByText("Mã đơn hàng: SO-12345");
    fireEvent.click(el);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "Mã đơn hàng: SO-12345",
      );
    });
  });
});
