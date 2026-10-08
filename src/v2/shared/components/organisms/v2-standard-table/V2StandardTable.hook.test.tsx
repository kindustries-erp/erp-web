import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAppStore } from "@/core/config/appStore";
import { useV2ColumnPreferences } from "./V2StandardTable.preferences.hook";
import { useV2TableColumns } from "./V2StandardTable.hook";
import type {
  V2Column,
  V2ColumnPreferences,
  V2ColumnPreferencesStorage,
} from "./V2StandardTable.type";

interface Row {
  id: string;
  code: string;
  name: string;
}

const ROWS: Row[] = [
  { id: "r1", code: "A-1", name: "Alpha" },
  { id: "r2", code: "B-2", name: "Beta" },
];

const makeColumns = (): V2Column<Row>[] => [
  { key: "code", label: "Mã", cell: (row, index) => `${row.code}#${index}` },
  { key: "name", label: "Tên", cell: (row) => row.name, enableResizing: false },
  { key: "locked", label: "Khóa", cell: () => "x", enableHiding: false },
];
const COLUMNS = makeColumns();
const KEYS = COLUMNS.map((c) => c.key);

const memoryStorage = (
  initial: V2ColumnPreferences | null = null,
): V2ColumnPreferencesStorage => ({
  load: () => initial,
  save: vi.fn(),
  clear: vi.fn(),
});

interface HarnessProps {
  startIndex?: number;
  enableRowSelection?: boolean;
  storage?: V2ColumnPreferencesStorage;
  onTable?: (table: ReturnType<typeof useReactTable<Row>>) => void;
}

const Harness = ({
  startIndex = 0,
  enableRowSelection = false,
  storage = memoryStorage(),
  onTable,
}: HarnessProps) => {
  const prefs = useV2ColumnPreferences({
    tableId: "t",
    columnKeys: KEYS,
    storage,
  });
  const { columnDefs, columnOrder, columnVisibility } = useV2TableColumns({
    columns: COLUMNS,
    prefs,
    enableRowSelection,
    startIndex,
  });
  const table = useReactTable({
    data: ROWS,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection,
    state: { columnOrder, columnVisibility, columnSizing: prefs.sizing },
  });
  onTable?.(table);
  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id} data-column={header.column.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const headerIds = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("th")).map((th) =>
    th.getAttribute("data-column"),
  );

describe("useV2TableColumns", () => {
  beforeEach(() => useAppStore.setState({ locale: "vi" }));

  it("renders the index column first with 1-based numbers", () => {
    const { container } = render(<Harness />);
    expect(headerIds(container)).toEqual(["__index", "code", "name", "locked"]);
    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("A-1#1")).toBeInTheDocument();
    expect(screen.getByText("B-2#2")).toBeInTheDocument();
  });

  it("offsets the index by the rows of previous pages", () => {
    render(<Harness startIndex={20} />);
    expect(screen.getByText("A-1#21")).toBeInTheDocument();
    expect(screen.getByText("B-2#22")).toBeInTheDocument();
  });

  it("adds a selection column with select-all and per-row checkboxes", () => {
    const { container } = render(<Harness enableRowSelection />);
    expect(headerIds(container)[0]).toBe("__selection");
    const selectAll = screen.getByRole("checkbox", { name: "Chọn tất cả" });
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Chọn dòng" })[0]);
    expect(
      screen.getAllByRole("checkbox", { name: "Chọn dòng" })[0],
    ).toBeChecked();
    expect(selectAll).toHaveAttribute("data-state", "indeterminate");
    fireEvent.click(selectAll);
    screen
      .getAllByRole("checkbox", { name: "Chọn dòng" })
      .forEach((box) => expect(box).toBeChecked());
  });

  it("applies saved order and visibility but never hides locked columns", () => {
    const storage = memoryStorage({
      visibility: { name: false, locked: false },
      order: ["locked", "name", "code"],
      sizing: {},
    });
    const { container } = render(<Harness storage={storage} />);
    expect(headerIds(container)).toEqual(["__index", "locked", "code"]);
  });

  it("keeps fixed columns fixed and honours per-column resizing", () => {
    let table: ReturnType<typeof useReactTable<Row>> | undefined;
    render(<Harness enableRowSelection onTable={(t) => (table = t)} />);
    const can = (id: string) => table?.getColumn(id)?.getCanResize();
    expect(can("__selection")).toBe(false);
    expect(can("__index")).toBe(false);
    expect(can("code")).toBe(true);
    expect(can("name")).toBe(false);
    expect(table?.getColumn("__index")?.getSize()).toBe(40);
    expect(table?.getColumn("code")?.getSize()).toBe(150);
  });

  it("restores saved column widths", () => {
    let table: ReturnType<typeof useReactTable<Row>> | undefined;
    const storage = memoryStorage({
      visibility: {},
      order: [],
      sizing: { code: 320 },
    });
    render(<Harness storage={storage} onTable={(t) => (table = t)} />);
    expect(table?.getColumn("code")?.getSize()).toBe(320);
  });
});
