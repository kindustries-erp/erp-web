import { fireEvent, render, screen } from "@testing-library/react";
import { Settings2 } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { V2ToolbarIconButton } from "./V2ToolbarIconButton";

const icon = <Settings2 className="h-4 w-4" />;

describe("V2ToolbarIconButton", () => {
  it("có aria-label + title từ label và chạy onClick", () => {
    const onClick = vi.fn();
    render(
      <V2ToolbarIconButton label="Cấu hình" icon={icon} onClick={onClick} />,
    );
    const btn = screen.getByRole("button", { name: "Cấu hình" });
    expect(btn).toHaveAttribute("title", "Cấu hình");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("kích thước và viền chuẩn: outline 32px", () => {
    render(<V2ToolbarIconButton label="A" icon={icon} />);
    const cls = screen.getByRole("button", { name: "A" }).className;
    expect(cls).toContain("w-8");
    expect(cls).toContain("h-8");
    expect(cls).toContain("border-input");
  });

  it("active đổi màu, badge chỉ hiện khi > 0", () => {
    const { rerender } = render(
      <V2ToolbarIconButton label="A" icon={icon} active badge={0} />,
    );
    expect(screen.getByRole("button").className).toContain("text-primary");
    expect(screen.queryByTestId("toolbar-icon-badge")).toBeNull();
    rerender(<V2ToolbarIconButton label="A" icon={icon} badge={3} />);
    expect(screen.getByTestId("toolbar-icon-badge")).toHaveTextContent("3");
  });

  it("chuyển tiếp ref và disabled", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<V2ToolbarIconButton ref={ref} label="A" icon={icon} disabled />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
