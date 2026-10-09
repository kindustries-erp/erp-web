import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import {
  TableSortState,
  V2_ALL_MATCHING_VALUE,
} from "@/v2/shared/types/v2-table";
import {
  isOpen,
  open,
  renderFilter,
  trigger,
} from "./V2ColumnHeaderFilter.fixture";

describe("V2ColumnHeaderFilter", () => {
  beforeEach(() => useAppStore.setState({ locale: "vi" }));

  it("hides the filter icon until hover when nothing is active", () => {
    renderFilter();
    expect(trigger()).toHaveAttribute("data-active", "false");
    expect(trigger().querySelector("span.opacity-0")).not.toBeNull();
  });

  it("shows the active state with a highlighted icon and a dot", () => {
    renderFilter({ selected: ["a"] });
    expect(trigger()).toHaveAttribute("data-active", "true");
    expect(trigger().querySelector("span.text-primary")).not.toBeNull();
    expect(trigger().querySelector("span.animate-ping")).not.toBeNull();
  });

  it("reports opening and closing to the table", () => {
    const props = renderFilter();
    open();
    expect(props.onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(props.onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("sorts from the panel and closes it", () => {
    const props = renderFilter({ sort: TableSortState.ASC });
    open();
    fireEvent.click(screen.getByRole("button", { name: /Sắp xếp tăng dần/ }));
    expect(props.onSortChange).toHaveBeenLastCalledWith(TableSortState.NONE);
    expect(isOpen()).toBe(false);
    open();
    fireEvent.click(screen.getByRole("button", { name: /Sắp xếp giảm dần/ }));
    expect(props.onSortChange).toHaveBeenLastCalledWith(TableSortState.DESC);
  });

  it("keeps selections pending until Apply is pressed", () => {
    const props = renderFilter();
    open();
    fireEvent.click(screen.getByRole("checkbox", { name: "Option A" }));
    expect(props.onSelectedChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(props.onSelectedChange).toHaveBeenCalledWith(["a"]);
    expect(isOpen()).toBe(false);
  });

  it("discards pending changes when closed without applying", () => {
    const props = renderFilter();
    open();
    fireEvent.click(screen.getByRole("checkbox", { name: "Option A" }));
    fireEvent.keyDown(document, { key: "Escape" });
    open();
    expect(
      screen.getByRole("checkbox", { name: "Option A" }),
    ).not.toBeChecked();
    expect(props.onSelectedChange).not.toHaveBeenCalled();
  });

  it("does not emit anything when Apply changes nothing", () => {
    const props = renderFilter({ selected: ["a"], search: "HD" });
    open();
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(props.onSelectedChange).not.toHaveBeenCalled();
    expect(props.onSearchChange).not.toHaveBeenCalled();
    expect(props.onOperatorChange).not.toHaveBeenCalled();
  });

  it("narrows options with a debounced search but commits it only on Enter", async () => {
    const props = renderFilter();
    open();
    const input = screen.getByPlaceholderText("Tìm kiếm...");
    fireEvent.change(input, { target: { value: " HD " } });
    await waitFor(() =>
      expect(props.onOptionsSearchChange).toHaveBeenCalledWith(" HD "),
    );
    expect(props.onSearchChange).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(props.onSearchChange).toHaveBeenCalledWith("HD");
    expect(isOpen()).toBe(false);
  });

  it("applies select-all-matching with the typed keyword", () => {
    const props = renderFilter();
    open();
    fireEvent.change(screen.getByPlaceholderText("Tìm kiếm..."), {
      target: { value: "opt" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "(Chọn tất cả kết quả tìm kiếm)" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(props.onSelectedChange).toHaveBeenCalledWith([
      V2_ALL_MATCHING_VALUE,
      "opt",
    ]);
  });

  it("clears the column filters and closes", () => {
    const props = renderFilter({ selected: ["a"] });
    open();
    fireEvent.click(screen.getByRole("button", { name: "Xóa bộ lọc" }));
    expect(props.onClear).toHaveBeenCalledTimes(1);
    expect(isOpen()).toBe(false);
  });
});
