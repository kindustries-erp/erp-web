import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { V2StandardTableDesktop } from "./V2StandardTable.desktop";
import { mockViewport, renderTable } from "./V2StandardTable.fixture";
import type { DemoRow } from "./V2StandardTable.fixture";

const makeActions = () => {
  const view = vi.fn();
  const remove = vi.fn();
  const rowActions = (row: DemoRow): V2RowActionGroup[] => [
    {
      groupLabel: "TRA CỨU",
      items: [
        { label: "Xem chi tiết", onClick: () => view(row.id) },
        { label: "In", onClick: vi.fn() },
      ],
    },
    {
      groupLabel: "THAO TÁC",
      items: [
        { label: "Chỉnh sửa", onClick: vi.fn() },
        { label: "Xóa", onClick: () => remove(row.id), variant: "danger" },
      ],
    },
  ];
  return { rowActions, view, remove };
};

const render = (overrides: Parameters<typeof renderTable>[1] = {}) =>
  renderTable(V2StandardTableDesktop, overrides);

describe("V2StandardTableDesktop row actions and header filters", () => {
  beforeEach(() => mockViewport(false));
  afterEach(() => vi.restoreAllMocks());

  it("renders floating quick actions on every row", () => {
    const { rowActions } = makeActions();
    render({ rowActions });
    expect(
      screen.getAllByRole("button", { name: "Xem chi tiết" }),
    ).toHaveLength(20);
    expect(screen.getAllByRole("button", { name: "Chỉnh sửa" })).toHaveLength(
      20,
    );
  });

  it("runs a quick action without any row click handler", () => {
    const { rowActions, view } = makeActions();
    render({ rowActions });
    fireEvent.click(screen.getAllByRole("button", { name: "Xem chi tiết" })[2]);
    expect(view).toHaveBeenCalledWith("r3");
  });

  it("opens the right-click menu for the row and runs an action", () => {
    const { rowActions, remove } = makeActions();
    render({ rowActions });
    const row = screen.getByText("HD-002").closest("tr") as HTMLElement;
    fireEvent.contextMenu(row, { clientX: 30, clientY: 40 });
    expect(row).toHaveAttribute("data-context-menu-active", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "Xóa" }));
    expect(remove).toHaveBeenCalledWith("r2");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not open a context menu when the table has no row actions", () => {
    render();
    const row = screen.getByText("HD-002").closest("tr") as HTMLElement;
    fireEvent.contextMenu(row);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("loads header filter options from fetchOptions and emits the filter", async () => {
    const onQueryChange = vi.fn();
    const { props } = render({ onQueryChange });
    fireEvent.click(screen.getByRole("button", { name: "Lọc cột Mã" }));
    fireEvent.click(await screen.findByRole("checkbox", { name: "HD-002" }));
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(props.fetchOptions).toHaveBeenCalledWith(
      expect.objectContaining({ columnKey: "code", pageParam: 1 }),
    );
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ columnFilters: { code: ["HD-002"] }, page: 1 }),
    );
    expect(
      screen.getByRole("button", { name: "Xóa bộ lọc (1)" }),
    ).toBeInTheDocument();
  });

  it("sorts from the header filter panel", () => {
    const onQueryChange = vi.fn();
    render({ onQueryChange });
    fireEvent.click(screen.getByRole("button", { name: "Lọc cột Số lượng" }));
    fireEvent.click(screen.getByRole("button", { name: "Sắp xếp giảm dần" }));
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sorts: [{ columnKey: "qty", direction: "desc" }],
      }),
    );
  });
});
