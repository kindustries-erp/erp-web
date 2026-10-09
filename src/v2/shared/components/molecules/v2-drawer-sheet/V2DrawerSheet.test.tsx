import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2DrawerSheet } from "./V2DrawerSheet";

describe("V2DrawerSheet", () => {
  it("renders an accessible dialog named by the title", () => {
    render(
      <V2DrawerSheet
        open
        side="floating"
        title="Chi tiết hóa đơn"
        onRequestClose={() => {}}
      >
        <p>nội dung</p>
      </V2DrawerSheet>,
    );

    expect(
      screen.getByRole("dialog", { name: "Chi tiết hóa đơn" }),
    ).toBeInTheDocument();
    expect(screen.getByText("nội dung")).toBeInTheDocument();
  });

  it("routes Escape through onRequestClose instead of closing silently", () => {
    const onRequestClose = vi.fn();
    render(
      <V2DrawerSheet
        open
        side="floating"
        title="T"
        onRequestClose={onRequestClose}
      >
        <p>x</p>
      </V2DrawerSheet>,
    );

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
