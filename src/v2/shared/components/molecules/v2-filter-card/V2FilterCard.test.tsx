import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColumnValueType } from "@/v2/shared/types/v2-table";
import { V2FilterCard } from "./V2FilterCard";

const base = {
  columnKey: "code",
  title: "Số HĐ",
  valueType: ColumnValueType.TEXT,
};

describe("V2FilterCard", () => {
  it("đóng: không render nội dung; bấm tiêu đề gọi onOpenChange(true)", () => {
    const onOpenChange = vi.fn();
    render(
      <V2FilterCard {...base} open={false} onOpenChange={onOpenChange}>
        <p>nội dung</p>
      </V2FilterCard>,
    );
    expect(screen.queryByText("nội dung")).toBeNull();
    const head = screen.getByRole("button", { name: /Số HĐ/ });
    expect(head).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(head);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("mở: render nội dung, aria-expanded=true, có id để cuộn tới", () => {
    const { container } = render(
      <V2FilterCard {...base} open onOpenChange={vi.fn()}>
        <p>nội dung</p>
      </V2FilterCard>,
    );
    expect(screen.getByText("nội dung")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Số HĐ/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(container.querySelector("#filter-card-code")).not.toBeNull();
  });

  it("chấm active chỉ hiện khi cột đang lọc", () => {
    const { rerender } = render(
      <V2FilterCard {...base} open={false} onOpenChange={vi.fn()}>
        x
      </V2FilterCard>,
    );
    expect(screen.queryByTestId("filter-card-dot")).toBeNull();
    rerender(
      <V2FilterCard {...base} active open={false} onOpenChange={vi.fn()}>
        x
      </V2FilterCard>,
    );
    expect(screen.getByTestId("filter-card-dot")).toBeInTheDocument();
  });
});
