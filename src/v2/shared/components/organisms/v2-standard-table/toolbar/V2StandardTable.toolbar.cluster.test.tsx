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
});
