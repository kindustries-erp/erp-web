import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2TableToolbarCluster } from "./V2StandardTable.toolbar.cluster";

const baseProps = {
  config: {},
  activeFilterCount: 0,
  onClearAllFilters: vi.fn(),
  selectedCount: 0,
  onClearSelection: vi.fn(),
};

describe("V2TableToolbarCluster", () => {
  it("calls onToggleFullscreen from the fullscreen button", () => {
    const onToggleFullscreen = vi.fn();
    render(
      <V2TableToolbarCluster
        {...baseProps}
        onToggleFullscreen={onToggleFullscreen}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Toàn màn hình" }));
    expect(onToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it("shows the exit label when already fullscreen", () => {
    render(
      <V2TableToolbarCluster
        {...baseProps}
        isFullscreen
        onToggleFullscreen={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Thoát toàn màn hình" }),
    ).toBeInTheDocument();
  });

  it("renders column toggle before filter button in DOM order", () => {
    const onFilterToggle = vi.fn();
    render(
      <V2TableToolbarCluster
        {...baseProps}
        config={{ onFilterToggle }}
        columnToggle={{
          columns: [{ key: "col1", label: "Col 1", visible: true }],
          onToggle: vi.fn(),
          onReorder: vi.fn(),
          onReset: vi.fn(),
        }}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const colBtnIdx = buttons.findIndex((b) =>
      b.getAttribute("aria-label")?.includes("Tùy chỉnh cột"),
    );
    const filterBtnIdx = buttons.findIndex((b) =>
      b.getAttribute("aria-label")?.includes("Bộ lọc"),
    );

    expect(colBtnIdx).toBeGreaterThanOrEqual(0);
    expect(filterBtnIdx).toBeGreaterThanOrEqual(0);
    expect(colBtnIdx).toBeLessThan(filterBtnIdx);
  });

  it("renders only V2TableFilterChip and not duplicate filter button when activeFilterCount > 0", () => {
    const onFilterToggle = vi.fn();
    const onClearAllFilters = vi.fn();
    render(
      <V2TableToolbarCluster
        {...baseProps}
        activeFilterCount={2}
        onClearAllFilters={onClearAllFilters}
        config={{ onFilterToggle }}
      />,
    );

    expect(screen.getByText("(2)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Xóa bộ lọc (2)" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Bộ lọc (2)" }));
    expect(onFilterToggle).toHaveBeenCalledTimes(1);

    const standaloneFilterButtons = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-label") === "Bộ lọc");
    expect(standaloneFilterButtons).toHaveLength(0);
  });
});
