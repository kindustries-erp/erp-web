import { describe, it, expect, beforeEach } from "vitest";
import {
  useV2MobileNavStore,
  MAX_PINNED_MOBILE_NAV,
} from "./useV2MobileNavStore";

describe("useV2MobileNavStore", () => {
  beforeEach(() => {
    useV2MobileNavStore.setState({ pinnedIds: [] });
    localStorage.clear();
  });

  it("khởi tạo với mảng rỗng", () => {
    expect(useV2MobileNavStore.getState().pinnedIds).toEqual([]);
    expect(useV2MobileNavStore.getState().isPinned("dashboard")).toBe(false);
  });

  it("cho phép setPinnedIds tối đa 5 items", () => {
    const { setPinnedIds } = useV2MobileNavStore.getState();
    setPinnedIds(["item-1", "item-2", "item-3", "item-4", "item-5", "item-6"]);

    expect(useV2MobileNavStore.getState().pinnedIds).toEqual([
      "item-1",
      "item-2",
      "item-3",
      "item-4",
      "item-5",
    ]);
    expect(useV2MobileNavStore.getState().pinnedIds.length).toBe(
      MAX_PINNED_MOBILE_NAV,
    );
  });

  it("togglePinnedId thêm mục mới khi còn chỗ và xóa khi đã tồn tại", () => {
    const { togglePinnedId } = useV2MobileNavStore.getState();

    const added = togglePinnedId("sales");
    expect(added).toBe(true);
    expect(useV2MobileNavStore.getState().pinnedIds).toEqual(["sales"]);
    expect(useV2MobileNavStore.getState().isPinned("sales")).toBe(true);

    const removed = togglePinnedId("sales");
    expect(removed).toBe(true);
    expect(useV2MobileNavStore.getState().pinnedIds).toEqual([]);
    expect(useV2MobileNavStore.getState().isPinned("sales")).toBe(false);
  });

  it("togglePinnedId chặn thêm khi đã đủ 5 items", () => {
    const { setPinnedIds, togglePinnedId } = useV2MobileNavStore.getState();
    setPinnedIds(["1", "2", "3", "4", "5"]);

    const blocked = togglePinnedId("6");
    expect(blocked).toBe(false);
    expect(useV2MobileNavStore.getState().pinnedIds).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
  });

  it("resetToDefault đưa mảng về rỗng", () => {
    const { setPinnedIds, resetToDefault } = useV2MobileNavStore.getState();
    setPinnedIds(["1", "2"]);
    expect(useV2MobileNavStore.getState().pinnedIds.length).toBe(2);

    resetToDefault();
    expect(useV2MobileNavStore.getState().pinnedIds).toEqual([]);
  });
});
