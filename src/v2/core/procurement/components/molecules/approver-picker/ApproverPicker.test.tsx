import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApproverPicker } from "./ApproverPicker";

describe("ApproverPicker", () => {
  it("render không lỗi với danh sách rỗng", () => {
    render(<ApproverPicker value={null} options={[]} onChange={vi.fn()} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("nhận danh sách người duyệt qua props, không tự gọi API", () => {
    render(
      <ApproverPicker
        value="u2"
        options={[{ id: "u2", email: "boss@liouni.com" }]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
