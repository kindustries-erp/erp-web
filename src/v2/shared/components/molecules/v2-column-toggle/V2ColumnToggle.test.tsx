import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2ColumnToggle } from "./V2ColumnToggle";
import { reorderKeys } from "./V2ColumnToggle.helper";
import type { V2ColumnToggleItem } from "./V2ColumnToggle.type";

const COLUMNS: V2ColumnToggleItem[] = [
  { key: "code", label: "Mã", visible: true, canHide: false },
  { key: "name", label: "Tên", visible: true },
  { key: "qty", label: "Số lượng", visible: false },
];

const renderToggle = (isCustomized = true) => {
  const props = {
    columns: COLUMNS,
    onToggle: vi.fn(),
    onReorder: vi.fn(),
    onReset: vi.fn(),
    isCustomized,
  };
  render(<V2ColumnToggle {...props} />);
  fireEvent.click(screen.getByLabelText("Tùy chỉnh cột"));
  return props;
};

describe("V2ColumnToggle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAppStore.setState({ locale: "vi" });
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
  });

  it("lists every column with its visibility state", () => {
    renderToggle();
    expect(screen.getByRole("checkbox", { name: "Mã" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Tên" })).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Số lượng" }),
    ).not.toBeChecked();
  });

  it("toggles a column and blocks columns that cannot be hidden", () => {
    const props = renderToggle();
    fireEvent.click(screen.getByRole("checkbox", { name: "Số lượng" }));
    expect(props.onToggle).toHaveBeenCalledWith("qty");
    expect(screen.getByRole("checkbox", { name: "Mã" })).toBeDisabled();
  });

  it("exposes a keyboard focusable drag handle per column", () => {
    renderToggle();
    expect(screen.getAllByLabelText("Kéo để đổi vị trí cột")).toHaveLength(3);
  });

  it("resets the layout only when it is customized", () => {
    const props = renderToggle(true);
    fireEvent.click(screen.getByRole("button", { name: "Khôi phục" }));
    expect(props.onReset).toHaveBeenCalledTimes(1);
  });

  it("disables reset for the default layout", () => {
    renderToggle(false);
    expect(screen.getByRole("button", { name: "Khôi phục" })).toBeDisabled();
  });
});

describe("reorderKeys", () => {
  it("moves a key onto the position of another key", () => {
    expect(reorderKeys(["a", "b", "c"], "a", "c")).toEqual(["b", "c", "a"]);
    expect(reorderKeys(["a", "b", "c"], "c", "a")).toEqual(["c", "a", "b"]);
  });

  it("returns the same order for unknown or identical keys", () => {
    const keys = ["a", "b"];
    expect(reorderKeys(keys, "a", "a")).toBe(keys);
    expect(reorderKeys(keys, "x", "b")).toBe(keys);
  });
});
