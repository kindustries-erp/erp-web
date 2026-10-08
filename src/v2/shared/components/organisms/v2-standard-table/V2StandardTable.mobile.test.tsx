import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { V2StandardTableMobile } from "./V2StandardTable.mobile";
import { makeRows, mockViewport, renderTable } from "./V2StandardTable.fixture";

const render = (overrides: Parameters<typeof renderTable>[1] = {}) =>
  renderTable(V2StandardTableMobile, overrides);

describe("V2StandardTableMobile", () => {
  beforeEach(() => mockViewport(true));
  afterEach(() => vi.restoreAllMocks());

  it("renders cards instead of a table, with title, subtitle and meta", () => {
    render();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const first = screen.getAllByRole("listitem")[0];
    expect(within(first).getByText("#1")).toBeInTheDocument();
    expect(within(first).getByText("HD-001")).toBeInTheDocument();
    expect(within(first).getByText("Alpha")).toBeInTheDocument();
    expect(within(first).getByText("Số lượng")).toBeInTheDocument();
    expect(within(first).getByText("Ngày")).toBeInTheDocument();
  });

  it("does not offer header filters or column settings", () => {
    render();
    expect(screen.queryByLabelText("Tùy chỉnh cột")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Lọc cột Mã" }),
    ).not.toBeInTheDocument();
  });

  it("continues the STT on later pages and paginates", () => {
    const onQueryChange = vi.fn();
    render({
      items: makeRows(20, 20),
      initialQuery: { page: 2, pageSize: 20 },
      onQueryChange,
    });
    expect(screen.getByText("#21")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Trang sau"));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 3 }),
    );
  });

  it("shows empty and loading states", () => {
    const { unmount } = render({ items: [], total: 0 });
    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
    unmount();
    render({ items: [], total: 0, loading: true });
    expect(screen.getByText("Đang tải dữ liệu...")).toBeInTheDocument();
  });

  it("selects cards by key", () => {
    const onSelectionChange = vi.fn();
    render({ enableRowSelection: true, onSelectionChange });
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Chọn dòng" })[1]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(["r2"]);
    expect(screen.getByText("Đã chọn 1")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Chọn dòng" })[1]);
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  });

  it("runs row actions from the card menu", () => {
    const run = vi.fn();
    render({
      rowActions: (row) => [
        { items: [{ label: "Xóa", onClick: () => run(row.id) }] },
      ],
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Thao tác khác" })[0],
    );
    fireEvent.click(screen.getByText("Xóa"));
    expect(run).toHaveBeenCalledWith("r1");
  });

  it("filters locally in client mode and clears from the toolbar", () => {
    render({
      mode: "client",
      items: makeRows(45),
      total: undefined,
      initialQuery: { pageSize: 20, columnFilters: { name: ["Alpha"] } },
    });
    expect(screen.getByText("1–20 / 23")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xóa bộ lọc (1)" }));
    expect(screen.getByText("1–20 / 45")).toBeInTheDocument();
  });
});
