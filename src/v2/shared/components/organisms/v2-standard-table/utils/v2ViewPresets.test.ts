import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  localStorageViewPresets,
  parseViewPresetState,
  readV2ViewState,
} from "./v2ViewPresets";

const STATE = {
  customViews: [
    {
      key: "custom_1",
      label: "Của tôi",
      baseKey: "audit",
      visibility: { code: true, amount: false },
      order: ["code", "amount"],
    },
  ],
  activeKey: "custom_1",
  filterKey: "new",
};

describe("parseViewPresetState", () => {
  it("giữ nguyên dữ liệu hợp lệ", () => {
    expect(parseViewPresetState(STATE)).toEqual(STATE);
  });

  it("giữ filterKey của custom view; view cũ không có thì không sinh khóa", () => {
    const parsed = parseViewPresetState({
      customViews: [
        {
          key: "custom_2",
          label: "Chờ duyệt",
          baseKey: "all",
          visibility: { code: true },
          order: ["code"],
          filterKey: "pending",
        },
        {
          key: "custom_3",
          label: "Cũ",
          baseKey: "all",
          visibility: {},
          order: [],
        },
        {
          key: "custom_4",
          label: "Sai kiểu",
          baseKey: "all",
          visibility: {},
          order: [],
          filterKey: 7,
        },
      ],
    });

    expect(parsed?.customViews[0]).toEqual({
      key: "custom_2",
      label: "Chờ duyệt",
      baseKey: "all",
      visibility: { code: true },
      order: ["code"],
      filterKey: "pending",
    });
    expect(parsed?.customViews[1]).not.toHaveProperty("filterKey");
    expect(parsed?.customViews[2]).not.toHaveProperty("filterKey");
  });

  it("bỏ qua view lỗi kiểu, không ném lỗi", () => {
    const parsed = parseViewPresetState({
      customViews: [
        { key: "bad", label: 1, baseKey: "overview", visibility: {} },
        {
          key: "ok",
          label: "Ok",
          baseKey: "overview",
          visibility: { a: true },
        },
        null,
      ],
      activeKey: 42,
    });
    expect(parsed?.customViews.map((v) => v.key)).toEqual(["ok"]);
    expect(parsed?.activeKey).toBeUndefined();
  });

  it("trả null khi dữ liệu không phải object", () => {
    expect(parseViewPresetState("abc")).toBeNull();
    expect(parseViewPresetState(null)).toBeNull();
  });
});

describe("localStorageViewPresets", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("lưu rồi đọc lại theo tableId", () => {
    localStorageViewPresets.save("invoices", STATE);
    expect(localStorageViewPresets.load("invoices")).toEqual(STATE);
    expect(localStorageViewPresets.load("other")).toBeNull();
  });

  it("JSON hỏng trả null", () => {
    window.localStorage.setItem("erp_v2_table_views:invoices", "{oops");
    expect(localStorageViewPresets.load("invoices")).toBeNull();
  });

  it("clear xóa đúng khóa của bảng", () => {
    localStorageViewPresets.save("invoices", STATE);
    localStorageViewPresets.clear("invoices");
    expect(localStorageViewPresets.load("invoices")).toBeNull();
  });

  it("storage ném lỗi thì không văng và trả rỗng", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => localStorageViewPresets.save("t", STATE)).not.toThrow();
    expect(localStorageViewPresets.load("t")).toBeNull();
    expect(readV2ViewState("t")).toEqual({ customViews: [] });
  });
});

describe("readV2ViewState", () => {
  it("giữ customFilters hợp lệ và bỏ mục sai kiểu", () => {
    const parsed = parseViewPresetState({
      customViews: [],
      customFilters: [
        {
          key: "cf_1",
          label: "Chờ duyệt",
          groupKey: "pending",
          query: { q: "PO", evil: 1 },
        },
        { key: "cf_2", label: "Thiếu query" },
        "rác",
      ],
    });

    expect(parsed?.customFilters).toEqual([
      {
        key: "cf_1",
        label: "Chờ duyệt",
        groupKey: "pending",
        query: { q: "PO" },
      },
    ]);
  });

  it("dữ liệu cũ không có customFilters thì để trống (undefined)", () => {
    const parsed = parseViewPresetState({ customViews: [] });
    expect(parsed?.customFilters).toBeUndefined();
  });

  it("trả trạng thái rỗng khi chưa lưu gì", () => {
    const storage = { load: () => null, save: vi.fn(), clear: vi.fn() };
    expect(readV2ViewState("t", storage)).toEqual({ customViews: [] });
  });
});
