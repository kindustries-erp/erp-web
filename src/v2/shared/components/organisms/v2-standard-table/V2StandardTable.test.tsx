import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { V2StandardTable } from "./V2StandardTable";
import { mockViewport, renderTable } from "./V2StandardTable.fixture";

describe("V2StandardTable switcher", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders the table layout on desktop viewports", () => {
    mockViewport(false);
    renderTable(V2StandardTable);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders the card list on mobile viewports", () => {
    mockViewport(true);
    renderTable(V2StandardTable);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0);
  });

  it("does not wrap the table in an extra bordered container", () => {
    mockViewport(false);
    const { container } = renderTable(V2StandardTable);
    const bordered = container.querySelectorAll(".rounded-xl.border");
    expect(bordered).toHaveLength(1);
    expect(bordered[0].querySelector("table")).not.toBeNull();
  });

  it("matches the V1 spreadsheet variant", () => {
    mockViewport(false);
    const { container } = renderTable(V2StandardTable);
    const table = screen.getByRole("table");
    expect(table).toHaveClass("border-collapse", "table-fixed");

    const header = container.querySelector('th[data-column="code"]');
    expect(header).toHaveClass("border-r", "uppercase", "text-[11px]");
    expect(header?.closest("tr")).toHaveClass("h-8");

    const row = container.querySelector("tbody tr");
    expect(row).toHaveClass("h-[38px]");
    expect(row?.querySelector("td")).toHaveClass("border-r", "text-xs");

    const frame = table.closest("div.rounded-xl");
    expect(frame).toHaveClass("border", "overflow-auto");
    expect(frame?.contains(screen.getByRole("navigation"))).toBe(false);
  });
});
