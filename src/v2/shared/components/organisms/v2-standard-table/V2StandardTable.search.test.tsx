import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, renderHook, screen } from "@testing-library/react";
import { V2StandardTableDesktop } from "./V2StandardTable.desktop";
import { makeRows, mockViewport, renderTable } from "./V2StandardTable.fixture";
import { useV2TableState } from "./V2StandardTable.state.hook";
import { searchClientItems } from "./v2TableFilter";

const typeSearch = (text: string) => {
  const box = screen.getByRole("textbox", { name: "Tìm kiếm..." });
  fireEvent.change(box, { target: { value: text } });
  fireEvent.keyDown(box, { key: "Enter" });
};

describe("V2StandardTable global search", () => {
  beforeEach(() => mockViewport(false));
  afterEach(() => vi.restoreAllMocks());

  it("không bật toolbar.search thì không có ô tìm kiếm", () => {
    renderTable(V2StandardTableDesktop, { toolbar: {} });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("chế độ client lọc dòng theo mọi cột", () => {
    renderTable(V2StandardTableDesktop, {
      mode: "client",
      items: makeRows(6),
      total: undefined,
      toolbar: { search: {} },
    });
    expect(screen.getByText("HD-001")).toBeInTheDocument();
    typeSearch("beta");
    expect(screen.queryByText("HD-001")).not.toBeInTheDocument();
    expect(screen.getByText("HD-002")).toBeInTheDocument();
  });

  it("chế độ server báo query.search và về trang 1", () => {
    const onQueryChange = vi.fn();
    renderTable(V2StandardTableDesktop, {
      toolbar: { search: {} },
      onQueryChange,
    });
    typeSearch("abc");
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: "abc", page: 1 }),
    );
  });

  it("dùng placeholder tùy chỉnh", () => {
    renderTable(V2StandardTableDesktop, {
      toolbar: { search: { placeholder: "Tìm số hóa đơn" } },
    });
    expect(
      screen.getByRole("textbox", { name: "Tìm số hóa đơn" }),
    ).toBeInTheDocument();
  });
});

describe("useV2TableState search", () => {
  it("setSearch cập nhật query và về trang 1", () => {
    const { result } = renderHook(() =>
      useV2TableState({ initialQuery: { page: 3 } }),
    );
    act(() => result.current.setSearch("abc"));
    expect(result.current.query.search).toBe("abc");
    expect(result.current.query.page).toBe(1);
  });

  it("chuỗi rỗng xóa search, resetAll cũng xóa", () => {
    const { result } = renderHook(() =>
      useV2TableState({ initialQuery: { search: "abc" } }),
    );
    act(() => result.current.setSearch("   "));
    expect(result.current.query.search).toBeUndefined();
    act(() => result.current.setSearch("xyz"));
    act(() => result.current.resetAll());
    expect(result.current.query.search).toBeUndefined();
  });
});

describe("searchClientItems", () => {
  const rows = [
    { a: "Alpha", b: 1 },
    { a: "Beta", b: 22 },
  ];
  const values = (row: { a: string; b: number }) => [row.a, row.b];

  it("trả nguyên danh sách khi không có từ khóa", () => {
    expect(searchClientItems(rows, values, "")).toBe(rows);
    expect(searchClientItems(rows, values, undefined)).toBe(rows);
  });

  it("khớp bất kỳ cột nào, không phân biệt hoa thường", () => {
    expect(searchClientItems(rows, values, "ALP")).toEqual([rows[0]]);
    expect(searchClientItems(rows, values, "22")).toEqual([rows[1]]);
  });

  it("hỗ trợ nhiều từ khóa bằng dấu ; và khớp chính xác bằng dấu nháy", () => {
    expect(searchClientItems(rows, values, "alpha;beta")).toEqual(rows);
    expect(searchClientItems(rows, values, '"alp"')).toEqual([]);
  });
});
