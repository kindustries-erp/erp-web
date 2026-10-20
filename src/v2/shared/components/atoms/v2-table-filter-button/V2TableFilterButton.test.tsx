import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2TableFilterButton } from "./V2TableFilterButton";

describe("V2TableFilterButton", () => {
  it("gọi onClick, không badge khi chưa lọc", () => {
    const onClick = vi.fn();
    render(<V2TableFilterButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Bộ lọc" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("toolbar-icon-badge")).toBeNull();
  });

  it("hiện badge số cột đang lọc", () => {
    render(<V2TableFilterButton activeCount={3} />);
    expect(screen.getByTestId("toolbar-icon-badge")).toHaveTextContent("3");
  });
});
