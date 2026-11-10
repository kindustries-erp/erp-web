import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2_IDLE_OPTIONS_STATE } from "@/v2/shared/components/molecules/v2-column-header-filter/V2ColumnHeaderFilter.type";
import { ColumnValueType } from "@/v2/shared/types/v2-table";
import type { V2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import { useV2TableState } from "../hooks/V2StandardTable.state.hook";
import type { V2FilterPresetEditorSource } from "../hooks/V2StandardTable.filterpresets.hook";
import type { V2FilterColumn } from "../filterpanel/V2StandardTable.filtercards";
import { createInitialQuery } from "../utils/v2TableQuery";
import { V2FilterPresetEditor } from "./V2StandardTable.filterdialog.editor";

const columns: V2FilterColumn[] = [
  {
    key: "poNumber",
    label: "Số đề nghị",
    filter: { valueType: ColumnValueType.TEXT },
  },
  {
    key: "amount",
    label: "Tổng dự kiến",
    filter: { valueType: ColumnValueType.NUMBER },
  },
];

const makeFilters = (): V2HeaderFilters => ({
  onOpenChange: vi.fn(),
  onOptionsSearchChange: vi.fn(),
  optionsFor: () => V2_IDLE_OPTIONS_STATE,
});

const makeSource = (
  tableQuery = createInitialQuery({ pageSize: 20 }),
): V2FilterPresetEditorSource => ({
  tableId: "editor-test",
  columns,
  fetchOptionsForKey: () => undefined,
  filtersStrForQuery: () => undefined,
  tableQuery,
});

/** Bản nháp thật (useV2TableState) như trong hộp thoại */
function Harness({
  source,
  filters,
  initialQuery,
}: {
  source: V2FilterPresetEditorSource;
  filters: V2HeaderFilters;
  initialQuery?: ReturnType<typeof createInitialQuery>;
}) {
  const table = useV2TableState({ initialQuery });
  return (
    <V2FilterPresetEditor source={source} table={table} filters={filters} />
  );
}

const renderEditor = (
  opts: {
    tableQuery?: ReturnType<typeof createInitialQuery>;
    initialQuery?: ReturnType<typeof createInitialQuery>;
  } = {},
) => {
  const filters = makeFilters();
  const source = makeSource(opts.tableQuery);
  render(
    <Harness
      source={source}
      filters={filters}
      initialQuery={opts.initialQuery}
    />,
  );
  return { filters, source };
};

const withFilter = (value: string) => ({
  ...createInitialQuery({ pageSize: 20 }),
  columnFilters: { poNumber: [value] },
});

describe("V2FilterPresetEditor", () => {
  it("hiện đủ tên cột trong danh sách card dạng grid, không co chiều cao", () => {
    renderEditor();

    const card = screen.getByText("Số đề nghị").closest("[id^=filter-card-]");
    expect(card).not.toBeNull();
    expect(card?.parentElement?.className).toContain("grid");
    expect(screen.getByText("Tổng dự kiến")).toBeInTheDocument();
  });

  it("ô tìm cột thu hẹp danh sách card", () => {
    renderEditor();

    fireEvent.change(screen.getByLabelText("Tìm cột cần lọc..."), {
      target: { value: "tổng" },
    });

    expect(screen.queryByText("Số đề nghị")).toBeNull();
    expect(screen.getByText("Tổng dự kiến")).toBeInTheDocument();
  });

  it("báo không có cột phù hợp khi tìm không khớp", () => {
    renderEditor();

    fireEvent.change(screen.getByLabelText("Tìm cột cần lọc..."), {
      target: { value: "không có" },
    });

    expect(screen.getByText("Không có cột phù hợp")).toBeInTheDocument();
  });

  it("nút Xóa điều kiện bị khóa khi chưa có điều kiện", () => {
    renderEditor();

    expect(
      screen.getByRole("button", { name: "Xóa điều kiện" }),
    ).toBeDisabled();
  });

  it("có điều kiện: hiện chip và Xóa điều kiện gỡ hết", () => {
    renderEditor({ initialQuery: withFilter("PO-001") });

    expect(screen.getByText("Đang lọc (1)")).toBeInTheDocument();
    const clear = screen.getByRole("button", { name: "Xóa điều kiện" });
    expect(clear).toBeEnabled();

    fireEvent.click(clear);

    expect(screen.queryByText("Đang lọc (1)")).toBeNull();
    expect(screen.getByText("Điều kiện lọc")).toBeInTheDocument();
  });

  it("Dùng điều kiện đang áp dụng nạp điều kiện của bảng vào bản nháp", () => {
    renderEditor({ tableQuery: withFilter("PO-777") });

    expect(screen.queryByText("Đang lọc (1)")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Dùng điều kiện đang áp dụng" }),
    );

    expect(screen.getByText("Đang lọc (1)")).toBeInTheDocument();
  });

  it("chỉ một card mở một lúc: mở card mới thì đóng card cũ", () => {
    const { filters } = renderEditor();

    fireEvent.click(screen.getByRole("button", { name: /Số đề nghị/ }));
    fireEvent.click(screen.getByRole("button", { name: /Tổng dự kiến/ }));

    expect(filters.onOpenChange).toHaveBeenCalledWith("poNumber", true, "");
    expect(filters.onOpenChange).toHaveBeenCalledWith("poNumber", false, "");
    expect(filters.onOpenChange).toHaveBeenCalledWith("amount", true, "");
  });
});
