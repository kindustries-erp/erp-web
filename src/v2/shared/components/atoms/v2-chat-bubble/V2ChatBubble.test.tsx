import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2ChatBubble } from "./V2ChatBubble";

describe("V2ChatBubble", () => {
  it("mặc định là tin của trợ lý, căn trái, nền surface", () => {
    render(<V2ChatBubble data-testid="row">Xin chào</V2ChatBubble>);
    const row = screen.getByTestId("row");
    expect(row.dataset.role).toBe("assistant");
    expect(row.className).toContain("justify-start");
    expect(screen.getByText("Xin chào").className).toContain("bg-surface");
  });

  it("tin của người dùng căn phải, nền primary", () => {
    render(
      <V2ChatBubble role="user" data-testid="row">
        hd.pdf
      </V2ChatBubble>,
    );
    expect(screen.getByTestId("row").className).toContain("justify-end");
    expect(screen.getByText("hd.pdf").className).toContain("bg-primary");
  });

  it("plain bỏ nền để chứa nội dung dạng thẻ", () => {
    render(<V2ChatBubble plain>Bảng</V2ChatBubble>);
    const body = screen.getByText("Bảng");
    expect(body.className).toContain("w-full");
    expect(body.className).not.toContain("bg-surface");
  });
});
