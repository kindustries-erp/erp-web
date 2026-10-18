import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PnlViewModeSwitch } from "./PnlViewModeSwitch";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal,
  }),
}));

describe("PnlViewModeSwitch Molecule", () => {
  it("renders labels and switch properly in default mode (All)", () => {
    const handleChange = vi.fn();
    render(<PnlViewModeSwitch isOjOnly={false} onChange={handleChange} />);

    const allLabel = screen.getByText("Toàn bộ");
    const ojLabel = screen.getByText("Riêng OJ");
    const switchEl = screen.getByRole("switch");

    expect(allLabel).toBeInTheDocument();
    expect(ojLabel).toBeInTheDocument();
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute("aria-checked", "false");
    expect(allLabel.className).toContain("text-primary");
  });

  it("highlights OJ label when isOjOnly is true", () => {
    const handleChange = vi.fn();
    render(<PnlViewModeSwitch isOjOnly={true} onChange={handleChange} />);

    const ojLabel = screen.getByText("Riêng OJ");
    const switchEl = screen.getByRole("switch");

    expect(switchEl).toHaveAttribute("aria-checked", "true");
    expect(ojLabel.className).toContain("text-primary");
  });

  it("calls onChange(true) when clicking OJ label", () => {
    const handleChange = vi.fn();
    render(<PnlViewModeSwitch isOjOnly={false} onChange={handleChange} />);

    fireEvent.click(screen.getByText("Riêng OJ"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange(false) when clicking All label in OJ mode", () => {
    const handleChange = vi.fn();
    render(<PnlViewModeSwitch isOjOnly={true} onChange={handleChange} />);

    fireEvent.click(screen.getByText("Toàn bộ"));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("does not trigger onChange when disabled", () => {
    const handleChange = vi.fn();
    render(
      <PnlViewModeSwitch
        isOjOnly={false}
        onChange={handleChange}
        disabled={true}
      />,
    );

    fireEvent.click(screen.getByText("Riêng OJ"));
    expect(handleChange).not.toHaveBeenCalled();
  });
});
