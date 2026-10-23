import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VinfastPartsSyncDrawer } from "./VinfastPartsSyncDrawer";

const startSync = vi.fn();

vi.mock("../hooks/useVinfastPartsSyncRun", () => ({
  useVinfastPartsSyncRun: () => ({
    isSyncing: false,
    progress: 0,
    currentItem: undefined,
    logs: [],
    status: "idle",
    startSync,
  }),
}));

describe("VinfastPartsSyncDrawer", () => {
  beforeEach(() => {
    startSync.mockClear();
  });

  it("renders the sync configuration and progress sections", () => {
    render(<VinfastPartsSyncDrawer open onClose={vi.fn()} />);

    expect(screen.getByText("Đồng bộ danh mục Vinfast")).toBeInTheDocument();
    expect(screen.getByText("Cấu hình đồng bộ")).toBeInTheDocument();
    expect(screen.getByRole("log")).toBeInTheDocument();
  });

  it("starts a sync with the selected range and clear option", () => {
    render(<VinfastPartsSyncDrawer open onClose={vi.fn()} />);

    fireEvent.click(screen.getByText("Bắt đầu đồng bộ"));

    expect(startSync).toHaveBeenCalledTimes(1);
    const params = startSync.mock.calls[0][0];
    expect(params.syncRange).toBe("custom");
    expect(params.clearDb).toBe(false);
    expect(params.dateFrom).toMatch(/^\d{4}-\d{2}-01$/);
  });
});
