import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useV2ColumnPreferences } from "./V2StandardTable.preferences.hook";
import type { V2ColumnPreferencesStorage } from "./V2StandardTable.type";

const COLUMN_KEYS = ["code", "name", "qty"];

const createStorage = (
  initial: ReturnType<V2ColumnPreferencesStorage["load"]> = null,
) => {
  const storage = {
    load: vi.fn(() => initial),
    save: vi.fn(),
    clear: vi.fn(),
  } satisfies V2ColumnPreferencesStorage;
  return storage;
};

const setup = (storage = createStorage()) =>
  renderHook(() =>
    useV2ColumnPreferences({
      tableId: "t",
      columnKeys: COLUMN_KEYS,
      storage,
    }),
  );

describe("useV2ColumnPreferences", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts from defaults and does not save on mount", () => {
    const storage = createStorage();
    const { result } = setup(storage);
    expect(result.current.orderedKeys).toEqual(COLUMN_KEYS);
    expect(result.current.isCustomized).toBe(false);
    expect(result.current.isVisible("code")).toBe(true);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it("hydrates from storage", () => {
    const storage = createStorage({
      visibility: { name: false },
      order: ["qty", "code"],
      sizing: { code: 240 },
    });
    const { result } = setup(storage);
    expect(result.current.orderedKeys).toEqual(["qty", "code", "name"]);
    expect(result.current.isVisible("name")).toBe(false);
    expect(result.current.sizing).toEqual({ code: 240 });
    expect(result.current.isCustomized).toBe(true);
  });

  it("toggles visibility and persists, but never hides the last column", () => {
    const storage = createStorage();
    const { result } = setup(storage);
    act(() => result.current.toggleColumn("name"));
    expect(result.current.isVisible("name")).toBe(false);
    expect(storage.save).toHaveBeenLastCalledWith(
      "t",
      expect.objectContaining({ visibility: { name: false } }),
    );

    act(() => result.current.toggleColumn("qty"));
    act(() => result.current.toggleColumn("code"));
    expect(result.current.isVisible("code")).toBe(true);
  });

  it("applies a new order and keeps unknown columns appended", () => {
    const storage = createStorage();
    const { result } = setup(storage);
    act(() => result.current.setOrder(["qty", "code"]));
    expect(result.current.orderedKeys).toEqual(["qty", "code", "name"]);
    expect(storage.save).toHaveBeenLastCalledWith(
      "t",
      expect.objectContaining({ order: ["qty", "code"] }),
    );
  });

  it("stores sizing and resets everything including storage", () => {
    const storage = createStorage();
    const { result } = setup(storage);
    act(() => result.current.setSizing({ code: 300 }));
    expect(storage.save).toHaveBeenCalledTimes(1);

    act(() => result.current.reset());
    expect(storage.clear).toHaveBeenCalledWith("t");
    expect(result.current.isCustomized).toBe(false);
    expect(result.current.sizing).toEqual({});
    expect(storage.save).toHaveBeenCalledTimes(1);
  });
});
