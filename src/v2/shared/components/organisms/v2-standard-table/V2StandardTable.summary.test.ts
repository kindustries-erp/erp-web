import { describe, expect, it } from "vitest";
import {
  buildSummarySignature,
  computeClientSummary,
  createServerSummaryState,
  cumulativeFromPages,
  readSummaryNumber,
  recordPageSum,
} from "./V2StandardTable.summary";
import type { V2Column } from "./V2StandardTable.type";

type Row = { amount: number; qty: { total: number } | null };

const column = (over: Partial<V2Column<Row>> = {}): V2Column<Row> => ({
  key: "amount",
  label: "Thành tiền",
  cell: () => null,
  summary: { variant: "amount" },
  ...over,
});

describe("readSummaryNumber", () => {
  it("đọc theo key, hỗ trợ đường dẫn lồng nhau và bỏ qua giá trị không hữu hạn", () => {
    expect(readSummaryNumber(column(), { amount: 12, qty: null })).toBe(12);
    expect(
      readSummaryNumber(column({ key: "qty.total" }), {
        amount: 0,
        qty: { total: 7 },
      }),
    ).toBe(7);
    expect(readSummaryNumber(column(), { amount: Number.NaN, qty: null })).toBe(
      0,
    );
  });

  it("ưu tiên accessor của summary", () => {
    const col = column({
      summary: { variant: "amount", accessor: (r) => r.amount * 2 },
    });
    expect(readSummaryNumber(col, { amount: 5, qty: null })).toBe(10);
  });
});

describe("computeClientSummary", () => {
  const read = (r: Row) => r.amount;
  const sorted = [1, 2, 3, 4, 5].map((n) => ({ amount: n * 10, qty: null }));

  it("trang 2: subtotal là dòng trang 2, lũy kế gồm trang 1 và 2", () => {
    const pageRows = sorted.slice(2, 4);
    expect(computeClientSummary(read, sorted, pageRows, 2, 2)).toEqual({
      pageValue: 70,
      totalValue: 150,
      cumulativeValue: 100,
    });
  });

  it("không phân trang: lũy kế bằng tổng", () => {
    const result = computeClientSummary(read, sorted, sorted, 1, 10);
    expect(result.cumulativeValue).toBe(150);
    expect(result.pageValue).toBe(150);
  });
});

describe("server accumulator", () => {
  const sig = buildSummarySignature({
    page: 1,
    pageSize: 20,
    sorts: [],
  } as never);

  it("trang 1 luôn có lũy kế bằng trang hiện tại", () => {
    expect(cumulativeFromPages(createServerSummaryState(), sig, 1, 40)).toBe(
      40,
    );
  });

  it("cộng dồn đúng khi đã đi qua các trang trước", () => {
    let state = createServerSummaryState();
    state = recordPageSum(state, sig, 1, 40);
    state = recordPageSum(state, sig, 2, 25);
    expect(cumulativeFromPages(state, sig, 3, 10)).toBe(75);
  });

  it("thiếu một trang trước đó thì không có lũy kế", () => {
    let state = createServerSummaryState();
    state = recordPageSum(state, sig, 1, 40);
    expect(cumulativeFromPages(state, sig, 3, 10)).toBeUndefined();
  });

  it("đổi signature (filter/sort/pageSize) thì reset", () => {
    let state = createServerSummaryState();
    state = recordPageSum(state, sig, 1, 40);
    const other = buildSummarySignature({
      page: 1,
      pageSize: 50,
      sorts: [],
    } as never);
    expect(cumulativeFromPages(state, other, 2, 10)).toBeUndefined();
    state = recordPageSum(state, other, 1, 99);
    expect(state.pageSums).toEqual({ 1: 99 });
  });

  it("ghi lại cùng giá trị thì trả về cùng object", () => {
    const state = recordPageSum(createServerSummaryState(), sig, 1, 40);
    expect(recordPageSum(state, sig, 1, 40)).toBe(state);
  });
});
