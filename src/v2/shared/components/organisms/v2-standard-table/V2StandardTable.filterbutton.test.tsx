import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { V2StandardTableDesktop } from "./desktop/V2StandardTable.desktop";
import { mockViewport, renderTable } from "./mocks/V2StandardTable.fixture";

/** Bảng đang có một điều kiện lọc cột: nút "Bộ lọc (1)" hiện trên toolbar */
const withActiveFilter = {
  initialQuery: { pageSize: 20, columnFilters: { code: ["A-1"] } },
};

describe("nút Bộ lọc (n) trên toolbar", () => {
  beforeEach(() => mockViewport(false));
  afterEach(() => vi.restoreAllMocks());

  it("có filterPanel thì bấm nút mở panel bộ lọc", () => {
    renderTable(V2StandardTableDesktop, {
      ...withActiveFilter,
      toolbar: { filterPanel: {} },
    });

    fireEvent.click(screen.getByRole("button", { name: "Bộ lọc (1)" }));

    expect(screen.getByRole("dialog", { name: "Bộ lọc" })).toBeInTheDocument();
  });

  it("nút ✕ của drawer thì đóng panel", () => {
    renderTable(V2StandardTableDesktop, {
      ...withActiveFilter,
      toolbar: { filterPanel: {} },
    });

    fireEvent.click(screen.getByRole("button", { name: "Bộ lọc (1)" }));
    // Drawer là Sheet modal: nút trên thanh công cụ bị aria-hidden, đóng bằng nút ✕ của drawer
    fireEvent.click(screen.getByRole("button", { name: "Đóng bộ lọc" }));

    expect(
      screen.queryByRole("dialog", { name: "Bộ lọc" }),
    ).not.toBeInTheDocument();
  });
});
