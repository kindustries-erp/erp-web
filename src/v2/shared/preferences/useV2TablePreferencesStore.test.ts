import { beforeEach, describe, expect, it, vi } from "vitest";
import { V1_PREFERENCES_STORAGE_KEY } from "./v2TablePreferences.migrate";

/** Import lại store để chạy migrate khi module được nạp */
const loadStore = async () => {
  vi.resetModules();
  const mod = await import("./useV2TablePreferencesStore");
  return mod.useV2TablePreferencesStore;
};

const seedV1 = (tables: Record<string, unknown>) =>
  localStorage.setItem(
    V1_PREFERENCES_STORAGE_KEY,
    JSON.stringify({ state: { tables } }),
  );

describe("useV2TablePreferencesStore migrate từ V1", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("không throw khi một bảng V1 có views sai kiểu, các bảng khác vẫn migrate", async () => {
    seedV1({
      broken: { views: { key: "x" }, columnOrder: ["a"] },
      good: {
        columnOrder: ["b"],
        views: [{ key: "mine", label: "Của tôi", isCustom: true }],
      },
    });

    const store = await loadStore();
    const { tables, migrationVersion } = store.getState();

    expect(migrationVersion).toBe(1);
    expect(tables.broken?.views?.customViews).toEqual([]);
    expect(tables.good?.views?.customViews).toHaveLength(1);
  });

  it("bỏ qua bản ghi V1 là null mà không chặn các bảng còn lại", async () => {
    seedV1({ nothing: null, good: { columnOrder: ["b"] } });

    const store = await loadStore();

    expect(store.getState().tables.nothing).toBeUndefined();
    expect(store.getState().tables.good?.columns?.order).toEqual(["b"]);
  });

  it("bỏ qua alias _2 / __n của V1", async () => {
    seedV1({
      invoices: { columnOrder: ["a"] },
      invoices_2: { columnOrder: ["a"] },
    });

    const store = await loadStore();

    expect(store.getState().tables.invoices).toBeDefined();
    expect(store.getState().tables.invoices_2).toBeUndefined();
  });

  it("giữ nguyên cấu hình V2 đã có, không ghi đè bằng V1", async () => {
    localStorage.setItem(
      "v2_table_preferences",
      JSON.stringify({
        state: {
          tables: { invoices: { columns: { order: ["v2"] } } },
          migrationVersion: 0,
        },
        version: 0,
      }),
    );
    seedV1({ invoices: { columnOrder: ["v1"] } });

    const store = await loadStore();

    expect(store.getState().tables.invoices?.columns?.order).toEqual(["v2"]);
  });
});
