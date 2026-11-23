import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { DrawerModal } from "./DrawerModal";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => key,
}));

describe("DrawerModal Escape handling", () => {
  afterEach(() => {
    cleanup();
    document
      .querySelectorAll("[data-v2-standard-drawer]")
      .forEach((el) => el.remove());
  });

  it("đóng khi bấm Esc nếu không có drawer V2 nào đang mở", () => {
    const onClose = vi.fn();
    render(
      <DrawerModal open onClose={onClose} title="Công nợ">
        <div />
      </DrawerModal>,
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("không đóng drawer v1 khi drawer V2 đang mở chồng lên (Esc đóng V2 trước)", () => {
    const onClose = vi.fn();
    const v2Drawer = document.createElement("div");
    v2Drawer.setAttribute("data-v2-standard-drawer", "");
    document.body.appendChild(v2Drawer);

    render(
      <DrawerModal open onClose={onClose} title="Công nợ">
        <div />
      </DrawerModal>,
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("không phản ứng với phím khác Esc", () => {
    const onClose = vi.fn();
    render(
      <DrawerModal open onClose={onClose} title="Công nợ">
        <div />
      </DrawerModal>,
    );

    fireEvent.keyDown(window, { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });
});
