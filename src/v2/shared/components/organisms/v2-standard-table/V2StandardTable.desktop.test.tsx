import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { TableSortState } from "@/v2/shared/types/v2-table";
import { V2StandardTableDesktop } from "./V2StandardTable.desktop";
import {
  makeRows,
  memoryStorage,
  mockViewport,
  renderTable,
} from "./V2StandardTable.fixture";

const render = (overrides: Parameters<typeof renderTable>[1] = {}) =>
  renderTable(V2StandardTableDesktop, overrides);

describe("V2StandardTableDesktop", () => {
  beforeEach(() => mockViewport(false));
  afterEach(() => vi.restoreAllMocks());

  it("renders filterable headers, cells and 1-based STT", () => {
    render();
    expect(
      screen.getByRole("button", { name: "Lọc cột Mã" }),
    ).toBeInTheDocument();
    expect(screen.getByText("HD-001")).toBeInTheDocument();
    expect(
      screen.getByText("20", { selector: "span.tabular-nums" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("continues the STT on later pages in server mode", () => {
    render({
      items: makeRows(20, 20),
      initialQuery: { page: 2, pageSize: 20 },
    });
    expect(
      screen.getByText("21", { selector: "span.tabular-nums" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("shows empty and loading states", () => {
    const { unmount } = render({ items: [], total: 0 });
    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
    unmount();
    render({ items: [], total: 0, loading: true });
    expect(screen.getByText("Đang tải dữ liệu...")).toBeInTheDocument();
  });

  it("notifies onQueryChange with the new page", () => {
    const onQueryChange = vi.fn();
    render({ onQueryChange });
    fireEvent.click(screen.getByLabelText("Trang sau"));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, pageSize: 20 }),
    );
  });

  it("filters, sorts and paginates locally in client mode", () => {
    render({
      mode: "client",
      items: makeRows(45),
      total: undefined,
      initialQuery: {
        pageSize: 20,
        sorts: [{ columnKey: "qty", direction: TableSortState.DESC }],
      },
    });
    expect(screen.getByText("1–20 / 45")).toBeInTheDocument();
    const firstRow = screen.getAllByRole("row")[1];
    expect(within(firstRow).getByText("HD-045")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Trang sau"));
    expect(screen.getByText("21–40 / 45")).toBeInTheDocument();
  });

  it("applies initial filters and clears them from the toolbar", () => {
    render({
      mode: "client",
      items: makeRows(45),
      total: undefined,
      initialQuery: { pageSize: 20, columnFilters: { name: ["Alpha"] } },
    });
    expect(screen.getByText("1–20 / 23")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xóa bộ lọc (1)" }));
    expect(screen.getByText("1–20 / 45")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Xóa bộ lọc \(/ }),
    ).not.toBeInTheDocument();
  });

  it("selects rows by key and reports the selection", () => {
    const onSelectionChange = vi.fn();
    render({ enableRowSelection: true, onSelectionChange });
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Chọn dòng" })[0]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(["r1"]);
    expect(screen.getByText("Đã chọn 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Chọn tất cả" }));
    const lastCall = onSelectionChange.mock.calls.length - 1;
    expect(onSelectionChange.mock.calls[lastCall][0]).toHaveLength(20);
  });

  it("hides a column from the column settings and persists it", () => {
    const storage = memoryStorage();
    render({ preferencesStorage: storage });
    fireEvent.click(screen.getByLabelText("Tùy chỉnh cột"));
    fireEvent.click(screen.getByRole("checkbox", { name: "Tên" }));
    expect(
      screen.queryByRole("button", { name: "Lọc cột Tên" }),
    ).not.toBeInTheDocument();
    expect(storage.save).toHaveBeenLastCalledWith(
      "t-test",
      expect.objectContaining({ visibility: { name: false } }),
    );
  });
});
