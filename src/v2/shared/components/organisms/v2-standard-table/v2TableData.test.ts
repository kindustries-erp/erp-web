import { describe, expect, it, vi } from "vitest";
import { ColumnValueType } from "@/v2/shared/types/v2-table";
import {
  createClientFetchOptions,
  createStaticFetchOptions,
  getCellValue,
  resolveColumnFetchOptions,
  toClientColumns,
} from "./v2TableData";
import type { V2Column } from "./V2StandardTable.type";

interface Row {
  code: string;
  customer: { name: string };
}

const rows: Row[] = [
  { code: "B", customer: { name: "Zeta" } },
  { code: "A", customer: { name: "Alpha" } },
  { code: "A", customer: { name: "" } },
];

const codeColumn: V2Column<Row> = {
  key: "code",
  label: "Mã",
  cell: (row) => row.code,
  filter: { valueType: ColumnValueType.TEXT },
};
const plainColumn: V2Column<Row> = {
  key: "customer.name",
  label: "Khách",
  cell: (row) => row.customer.name,
};

describe("getCellValue", () => {
  it("reads nested paths and prefers the accessor", () => {
    expect(getCellValue(rows[0], "customer.name")).toBe("Zeta");
    expect(getCellValue(rows[0], "customer.missing.deep")).toBeUndefined();
    expect(getCellValue(rows[0], "code", () => "custom")).toBe("custom");
  });
});

describe("toClientColumns", () => {
  it("keeps only filterable columns and exposes their value getter", () => {
    const columns = toClientColumns([codeColumn, plainColumn]);
    expect(columns).toHaveLength(1);
    expect(columns[0]).toMatchObject({
      key: "code",
      valueType: ColumnValueType.TEXT,
    });
    expect(columns[0].getValue(rows[1])).toBe("A");
  });
});

describe("fetchOptions factories", () => {
  it("derives unique options from client data and paginates them", async () => {
    const fetch = createClientFetchOptions(rows, codeColumn);
    const result = await fetch({ columnKey: "code", search: "", pageParam: 1 });
    expect(result.items.map((i) => i.value)).toEqual(["A", "B"]);
    expect(result.next).toBeNull();
  });

  it("applies the search keyword to client options", async () => {
    const fetch = createClientFetchOptions(rows, codeColumn);
    const result = await fetch({
      columnKey: "code",
      search: "b",
      pageParam: 1,
    });
    expect(result.items.map((i) => i.value)).toEqual(["B"]);
  });

  it("serves static options with search", async () => {
    const fetch = createStaticFetchOptions([
      { value: "DRAFT", label: "Nháp" },
      { value: "DONE", label: "Hoàn tất" },
    ]);
    const result = await fetch({
      columnKey: "s",
      search: "hoàn",
      pageParam: 1,
    });
    expect(result.items).toEqual([{ value: "DONE", label: "Hoàn tất" }]);
  });
});

describe("resolveColumnFetchOptions", () => {
  const serverFetch = vi.fn();

  it("prefers static options, then client mode, then the server fetcher", () => {
    const withStatic: V2Column<Row> = {
      ...codeColumn,
      filter: {
        valueType: ColumnValueType.SELECT,
        filterOptions: [{ value: "x", label: "x" }],
      },
    };
    expect(
      resolveColumnFetchOptions(withStatic, rows, "server", serverFetch),
    ).not.toBe(serverFetch);
    expect(
      resolveColumnFetchOptions(codeColumn, rows, "server", serverFetch),
    ).toBe(serverFetch);
    expect(
      resolveColumnFetchOptions(codeColumn, rows, "client", serverFetch),
    ).not.toBe(serverFetch);
  });

  it("returns undefined when a server table has no fetcher", () => {
    expect(
      resolveColumnFetchOptions(codeColumn, rows, "server"),
    ).toBeUndefined();
  });
});
