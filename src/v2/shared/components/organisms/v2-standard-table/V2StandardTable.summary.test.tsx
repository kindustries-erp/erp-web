import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { V2StandardTable } from "./V2StandardTable";
import { V2StandardTableDesktop } from "./V2StandardTable.desktop";
import {
  COLUMNS,
  makeColumns,
  makeRows,
  mockViewport,
  renderTable,
} from "./V2StandardTable.fixture";
import type { DemoRow } from "./V2StandardTable.fixture";
import type { V2Column } from "./V2StandardTable.type";

const withQtySummary = (
  extra: Partial<NonNullable<V2Column<DemoRow>["summary"]>> = {},
): V2Column<DemoRow>[] =>
  makeColumns().map((column) =>
    column.key === "qty"
      ? { ...column, summary: { variant: "qty", ...extra } }
      : column,
  );

const summaryTrigger = (container: HTMLElement) =>
  within(container.querySelector("tfoot") as HTMLElement).getByRole("button", {
    name: "Xem chi tiết số liệu",
  });

describe("V2StandardTable summary row", () => {
  beforeEach(() => mockViewport(false));
  afterEach(() => vi.restoreAllMocks());

  it("không có cột summary thì không có hàng tổng", () => {
    const { container } = renderTable(V2StandardTableDesktop, {
      columns: COLUMNS,
    });
    expect(container.querySelector("tfoot")).toBeNull();
  });

  it("client: hiện tổng trang và tổng toàn bộ của cột có summary", () => {
    const { container } = renderTable(V2StandardTableDesktop, {
      columns: withQtySummary(),
      mode: "client",
      items: makeRows(20),
      initialQuery: { pageSize: 20 },
    });
    // qty = 10 + 20 + ... + 200 = 2100, pageSize 20 nên trang 1 có đủ dữ liệu
    expect(summaryTrigger(container)).toHaveTextContent("2.100");
  });

  it("client: trang 2 có lũy kế gồm trang 1 và trang 2", () => {
    const { container } = renderTable(V2StandardTableDesktop, {
      columns: withQtySummary(),
      mode: "client",
      items: makeRows(60),
      initialQuery: { pageSize: 20, page: 2 },
    });
    fireEvent.click(summaryTrigger(container));
    // qty = 10n; trang 1 = 2.100, trang 2 = 6.100, lũy kế = 8.200, tổng = 18.300
    expect(screen.getByText("Trang 2/3")).toBeInTheDocument();
    expect(screen.getByText("Lũy kế (T1 → T2)")).toBeInTheDocument();
    expect(screen.getByText("8.200")).toBeInTheDocument();
    expect(screen.getByText("Tổng toàn bộ (3 trang)")).toBeInTheDocument();
    expect(screen.getByText("18.300")).toBeInTheDocument();
  });

  it("server: tổng toàn bộ lấy từ summary.total của consumer", () => {
    const { container } = renderTable(V2StandardTableDesktop, {
      columns: withQtySummary({ total: 5000 }),
      mode: "server",
      items: makeRows(20),
      total: 100,
      initialQuery: { pageSize: 20 },
    });
    fireEvent.click(summaryTrigger(container));
    expect(screen.getByText("Tổng toàn bộ (5 trang)")).toBeInTheDocument();
    expect(screen.getAllByText("5.000").length).toBeGreaterThan(0);
  });

  it("mobile: không render hàng tổng", () => {
    mockViewport(true);
    const { container } = renderTable(V2StandardTable, {
      columns: withQtySummary(),
      mode: "client",
      items: makeRows(20),
    });
    expect(container.querySelector("tfoot")).toBeNull();
  });

  it("ô của hàng tổng dính đáy vùng cuộn (sticky bottom) và có nền đặc", () => {
    const { container } = renderTable(V2StandardTableDesktop, {
      columns: withQtySummary(),
      mode: "client",
      items: makeRows(20),
    });
    const cells = Array.from(
      container.querySelectorAll("tfoot td"),
    ) as HTMLElement[];
    expect(cells.length).toBeGreaterThan(0);
    cells.forEach((cell) => {
      expect(cell).toHaveClass("sticky", "bottom-0", "bg-surface");
    });
  });
});
