import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Plus } from "lucide-react";
import { V2BottomNavHeroButton } from "./V2BottomNavHeroButton";
import { V2HeroButtonSize } from "./V2BottomNavHeroButton.type";

describe("V2BottomNavHeroButton Molecule", () => {
  it("render đúng aria-label và gọi onClick khi click", () => {
    const handleClick = vi.fn();
    render(
      <V2BottomNavHeroButton
        label="Tạo mới"
        icon={Plus}
        onClick={handleClick}
      />,
    );

    const button = screen.getByRole("button", { name: "Tạo mới" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("render badge khi có badgeCount > 0", () => {
    render(
      <V2BottomNavHeroButton label="Tạo mới" icon={Plus} badgeCount={3} />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("hỗ trợ cấu hình kích thước qua enum V2HeroButtonSize", () => {
    render(
      <V2BottomNavHeroButton
        label="Tạo mới"
        icon={Plus}
        size={V2HeroButtonSize.SM}
      />,
    );

    const button = screen.getByRole("button", { name: "Tạo mới" });
    expect(button.className).toContain("h-11 w-11");
  });
});
