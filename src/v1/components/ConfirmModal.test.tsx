import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmModal } from "./ConfirmModal";

const base = {
  open: true,
  message: "Nội dung",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe("ConfirmModal", () => {
  it("keeps the compact 380px layout by default", () => {
    render(<ConfirmModal {...base} title="Tiêu đề" />);
    expect(screen.getByRole("dialog").className).toContain("max-w-[380px]");
    expect(screen.getByText("Tiêu đề").className).toContain("text-sm");
  });

  it("supports md size, icon and custom title class", () => {
    render(
      <ConfirmModal
        {...base}
        title="Tiêu đề"
        size="md"
        icon={<svg data-testid="icon" />}
        titleClassName="text-base"
      />,
    );
    expect(screen.getByRole("dialog").className).toContain("max-w-[480px]");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Tiêu đề").className).toContain("text-base");
  });
});
