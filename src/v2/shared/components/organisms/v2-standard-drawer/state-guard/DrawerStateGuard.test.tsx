import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DrawerStateGuard } from "./DrawerStateGuard";

describe("DrawerStateGuard", () => {
  it("renders children when not loading and no error", () => {
    render(
      <DrawerStateGuard>
        <p>Nội dung</p>
      </DrawerStateGuard>,
    );
    expect(screen.getByText("Nội dung")).toBeInTheDocument();
  });

  it("shows the loading text instead of children while loading", () => {
    render(
      <DrawerStateGuard loading>
        <p>Nội dung</p>
      </DrawerStateGuard>,
    );
    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
    expect(screen.queryByText("Nội dung")).not.toBeInTheDocument();
  });

  it("shows the error message instead of children when an error is set", () => {
    render(
      <DrawerStateGuard error="Không thể tải hóa đơn">
        <p>Nội dung</p>
      </DrawerStateGuard>,
    );
    expect(screen.getByText("Không thể tải hóa đơn")).toBeInTheDocument();
    expect(screen.queryByText("Nội dung")).not.toBeInTheDocument();
  });
});
