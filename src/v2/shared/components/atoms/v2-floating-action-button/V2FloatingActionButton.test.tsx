import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2FloatingActionButton } from "./V2FloatingActionButton";

describe("V2FloatingActionButton", () => {
  it("có nhãn truy cập, vùng chạm 48px và gọi onClick", () => {
    const onClick = vi.fn();
    render(
      <V2FloatingActionButton
        icon={<svg />}
        label="Trợ lý AI"
        onClick={onClick}
      />,
    );
    const button = screen.getByRole("button", { name: "Trợ lý AI" });
    expect(button.className).toContain("h-12");
    expect(button.className).toContain("w-12");
    expect(button.getAttribute("type")).toBe("button");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("extended hiện nhãn cạnh icon", () => {
    render(
      <V2FloatingActionButton icon={<svg />} label="Trợ lý AI" extended />,
    );
    expect(screen.getByText("Trợ lý AI")).toBeDefined();
  });
});
