import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CaseLinePaymentSelectedButton } from "./CaseLinePaymentSelectedButton";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, opts?: any) => {
      if (typeof opts === "string") return opts;
      if (opts && typeof opts === "object" && opts.defaultValue) {
        return typeof opts.defaultValue === "string" ? opts.defaultValue : k;
      }
      return k;
    },
  }),
}));

describe("CaseLinePaymentSelectedButton", () => {
  it("renders null when selectedCount is 0", () => {
    const onClick = vi.fn();
    const { container } = render(
      <CaseLinePaymentSelectedButton
        selectedCount={0}
        isActive={false}
        onClick={onClick}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders button with count when selectedCount > 0", () => {
    const onClick = vi.fn();
    render(
      <CaseLinePaymentSelectedButton
        selectedCount={3}
        isActive={false}
        onClick={onClick}
      />,
    );

    expect(screen.getByText("Đang chọn")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies active styles and aria-pressed true when isActive is true", () => {
    const onClick = vi.fn();
    render(
      <CaseLinePaymentSelectedButton
        selectedCount={2}
        isActive={true}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });
});
