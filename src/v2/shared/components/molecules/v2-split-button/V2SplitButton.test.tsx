import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2SplitButton } from "./V2SplitButton";

const menu = (trigger: React.ReactElement) => (
  <div data-testid="menu">{trigger}</div>
);

describe("V2SplitButton", () => {
  it("chỉ onClick: một nút", () => {
    const onClick = vi.fn();
    render(<V2SplitButton label="Đồng bộ" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Đồng bộ" }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.queryByTestId("menu")).toBeNull();
  });

  it("chỉ menu: nút nhãn là trigger của menu", () => {
    render(<V2SplitButton label="Thao tác" renderMenu={menu} />);
    expect(screen.getByTestId("menu")).toHaveTextContent("Thao tác");
  });

  it("cả hai: nút chính chạy onClick, chevron là trigger menu", () => {
    const onClick = vi.fn();
    render(
      <V2SplitButton label="Đồng bộ" onClick={onClick} renderMenu={menu} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Đồng bộ" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("menu")).toContainElement(
      screen.getByRole("button", { name: "Thao tác khác" }),
    );
  });
});
