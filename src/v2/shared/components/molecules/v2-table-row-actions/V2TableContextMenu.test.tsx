import { describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { makeGroups } from "./V2TableRowActions.fixture";
import { V2TableContextMenu } from "./V2TableContextMenu";
import { useRowContextMenu } from "./V2TableContextMenu.hook";

describe("V2TableContextMenu", () => {
  it("renders nothing without a position", () => {
    const { groups } = makeGroups();
    render(
      <V2TableContextMenu position={null} groups={groups} onClose={vi.fn()} />,
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders groups, runs an action and closes", () => {
    const { groups, handlers } = makeGroups();
    const onClose = vi.fn();
    render(
      <V2TableContextMenu
        position={{ x: 40, y: 50 }}
        groups={groups}
        onClose={onClose}
      />,
    );
    expect(screen.getByRole("menu")).toHaveStyle({ left: "40px", top: "50px" });
    expect(screen.getByText("TRA CỨU")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "Chỉnh sửa" }));
    expect(handlers.edit).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not run disabled actions", () => {
    const onClick = vi.fn();
    render(
      <V2TableContextMenu
        position={{ x: 0, y: 0 }}
        groups={[{ items: [{ label: "Khóa", onClick, disabled: true }] }]}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("menuitem", { name: "Khóa" })).toBeDisabled();
  });

  it("closes on Escape, outside mousedown and scroll but not on inside mousedown", () => {
    const { groups } = makeGroups();
    const onClose = vi.fn();
    render(
      <V2TableContextMenu
        position={{ x: 10, y: 10 }}
        groups={groups}
        onClose={onClose}
      />,
    );
    fireEvent.mouseDown(screen.getByRole("menu"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.mouseDown(document.body);
    fireEvent.scroll(window);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("clamps near the viewport edge using the measured size", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 200,
      height: 100,
    } as DOMRect);
    const { groups } = makeGroups();
    render(
      <V2TableContextMenu
        position={{ x: 1000, y: 750 }}
        groups={groups}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("menu")).toHaveStyle({
      left: "816px",
      top: "660px",
    });
    vi.restoreAllMocks();
  });
});

describe("useRowContextMenu", () => {
  it("stores the click position, prevents the native menu and closes", () => {
    const { result } = renderHook(() => useRowContextMenu());
    const preventDefault = vi.fn();
    act(() =>
      result.current.open(
        {
          preventDefault,
          clientX: 12,
          clientY: 34,
        } as unknown as React.MouseEvent,
        "row-1",
      ),
    );
    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.state).toEqual({ rowKey: "row-1", x: 12, y: 34 });
    act(() => result.current.close());
    expect(result.current.state).toBeNull();
  });
});
