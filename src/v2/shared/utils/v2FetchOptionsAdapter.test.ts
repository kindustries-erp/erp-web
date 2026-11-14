import { describe, expect, it } from "vitest";
import { toFetchOptionsResult } from "./v2FetchOptionsAdapter";

const pagination = (next: number | null) => ({
  page: 1,
  pageSize: 20,
  total: 45,
  totalPages: 3,
  next,
  previous: null,
});

describe("toFetchOptionsResult", () => {
  it("đổi pagination.total và pagination.next sang total và next của bảng", () => {
    expect(
      toFetchOptionsResult({
        items: [{ label: "A", value: "A" }],
        pagination: pagination(2),
      }),
    ).toEqual({
      items: [{ label: "A", value: "A" }],
      total: 45,
      next: 2,
    });
  });

  it("giữ next = null ở trang cuối", () => {
    expect(
      toFetchOptionsResult({ items: [], pagination: pagination(null) }).next,
    ).toBeNull();
  });
});
