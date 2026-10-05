import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import { V2LanguageSwitcher } from "./V2LanguageSwitcher";

describe("V2LanguageSwitcher", () => {
  beforeEach(() => {
    act(() => {
      useAppStore.getState().setLocale("vi");
    });
  });

  it("renders VI and EN options with correct active state", () => {
    render(<V2LanguageSwitcher />);

    const viBtn = screen.getByRole("button", { name: "VI" });
    const enBtn = screen.getByRole("button", { name: "EN" });

    expect(viBtn).toBeInTheDocument();
    expect(enBtn).toBeInTheDocument();
    expect(viBtn).toHaveAttribute("aria-pressed", "true");
    expect(enBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("switches to English when clicking EN button", () => {
    render(<V2LanguageSwitcher />);

    const enBtn = screen.getByRole("button", { name: "EN" });
    const viBtn = screen.getByRole("button", { name: "VI" });

    fireEvent.click(enBtn);

    expect(useAppStore.getState().locale).toBe("en");
    expect(enBtn).toHaveAttribute("aria-pressed", "true");
    expect(viBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("switches back to Vietnamese when clicking VI button", () => {
    act(() => {
      useAppStore.getState().setLocale("en");
    });

    render(<V2LanguageSwitcher />);

    const viBtn = screen.getByRole("button", { name: "VI" });
    const enBtn = screen.getByRole("button", { name: "EN" });

    expect(enBtn).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(viBtn);

    expect(useAppStore.getState().locale).toBe("vi");
    expect(viBtn).toHaveAttribute("aria-pressed", "true");
    expect(enBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("renders with custom class and sm size without error", () => {
    const { container } = render(
      <V2LanguageSwitcher size="sm" className="custom-switcher" />,
    );
    expect(container.firstChild).toHaveClass("custom-switcher");
    expect(container.firstChild).toHaveClass("h-5");
  });
});
