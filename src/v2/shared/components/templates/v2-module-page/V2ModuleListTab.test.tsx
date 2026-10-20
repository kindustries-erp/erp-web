import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { V2TableToolbarConfig } from "@/v2/shared/components/organisms/v2-standard-table";
import { V2ModuleListTab } from "./V2ModuleListTab";
import type { V2ModuleListTab as ListTabConfig } from "./V2ModulePage.type";

const captured = vi.hoisted(() => ({
  props: null as null | Record<string, any>,
}));

vi.mock("@/v2/shared/components/organisms/v2-standard-table", async () => {
  const actual = await vi.importActual<
    typeof import("@/v2/shared/components/organisms/v2-standard-table")
  >("@/v2/shared/components/organisms/v2-standard-table");
  return {
    ...actual,
    V2StandardTable: (props: Record<string, any>) => {
      captured.props = props;
      return <div data-testid="standard-table" />;
    },
  };
});

type Row = { id: string };

const refetch = vi.fn();

const makeTab = (
  toolbar?: V2TableToolbarConfig,
  summaries?: Record<string, number>,
): ListTabConfig<Row> => ({
  key: "list",
  label: "Danh sách",
  kind: "list",
  table: {
    tableId: "orders",
    getRowKey: (row) => row.id,
    toolbar,
    columns: [
      {
        key: "total",
        label: "Tổng",
        cell: () => null,
        summary: { variant: "amount" },
      },
      { key: "name", label: "Tên", cell: () => null },
    ],
  },
  useData: () => ({ items: [], total: 0, loading: false, refetch, summaries }),
});

describe("V2ModuleListTab", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/v2/orders");
    refetch.mockClear();
    captured.props = null;
  });
  afterEach(() => vi.restoreAllMocks());

  it("wires refetch into the toolbar refresh button", () => {
    render(<V2ModuleListTab tab={makeTab({})} />);
    expect(captured.props!.toolbar.onRefresh).toBe(refetch);
  });

  it("keeps a refresh handler the page already provided", () => {
    const own = vi.fn();
    render(<V2ModuleListTab tab={makeTab({ onRefresh: own })} />);
    expect(captured.props!.toolbar.onRefresh).toBe(own);
  });

  it("does not invent a toolbar when the page has none", () => {
    render(<V2ModuleListTab tab={makeTab()} />);
    expect(captured.props!.toolbar).toBeUndefined();
  });

  it("merges server summaries into the summary columns only", () => {
    render(<V2ModuleListTab tab={makeTab(undefined, { total: 9000 })} />);
    const columns = captured.props!.columns;
    expect(columns[0].summary.total).toBe(9000);
    expect(columns[1].summary).toBeUndefined();
  });

  it("leaves columns untouched without summaries", () => {
    const tab = makeTab();
    render(<V2ModuleListTab tab={tab} />);
    expect(captured.props!.columns).toBe(tab.table.columns);
  });
});
