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
    const { unmount } = render(
      <V2BottomNavHeroButton
        label="Tạo mới"
        icon={Plus}
        size={V2HeroButtonSize.SM}
      />,
    );

    let button = screen.getByRole("button", { name: "Tạo mới" });
    expect(button.className).toContain("h-9 w-9");
    unmount();

    // Default size is 44px
    const resDefault = render(
      <V2BottomNavHeroButton label="Tạo mới" icon={Plus} />,
    );
    button = screen.getByRole("button", { name: "Tạo mới" });
    expect(button.className).toContain("h-11 w-11");
    resDefault.unmount();

    // MD size is 40px
    const resMd = render(
      <V2BottomNavHeroButton
        label="Tạo mới"
        icon={Plus}
        size={V2HeroButtonSize.MD}
      />,
    );
    button = screen.getByRole("button", { name: "Tạo mới" });
    expect(button.className).toContain("h-10 w-10");
    resMd.unmount();

    // LG size is 52px
    render(
      <V2BottomNavHeroButton
        label="Tạo mới"
        icon={Plus}
        size={V2HeroButtonSize.LG}
      />,
    );
    button = screen.getByRole("button", { name: "Tạo mới" });
    expect(button.className).toContain("h-[52px] w-[52px]");
  });
});
