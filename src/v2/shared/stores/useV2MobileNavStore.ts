import { create } from "zustand";
import { persist } from "zustand/middleware";

export const V2_MOBILE_NAV_STORAGE_KEY = "v2_mobile_nav_pinned";
export const MAX_PINNED_MOBILE_NAV = 5;

export interface V2MobileNavState {
  /** Danh sách các ID mục đã ghim làm quick actions (tối đa 5) */
  pinnedIds: string[];
  /** Gán trực tiếp danh sách IDs đã chọn (tự động cắt về tối đa 5) */
  setPinnedIds: (ids: string[]) => void;
  /** Bật/tắt ghim một mục. Trả về true nếu thành công, false nếu đã đạt tối đa 5 */
  togglePinnedId: (id: string) => boolean;
  /** Kiểm tra một ID có đang được ghim không */
  isPinned: (id: string) => boolean;
  /** Khôi phục về mặc định (danh sách rỗng để layout tự chọn theo quyền) */
  resetToDefault: () => void;
}

export const useV2MobileNavStore = create<V2MobileNavState>()(
  persist(
    (set, get) => ({
      pinnedIds: [],

      setPinnedIds: (ids) => {
        set({ pinnedIds: ids.slice(0, MAX_PINNED_MOBILE_NAV) });
      },

      togglePinnedId: (id) => {
        const { pinnedIds } = get();
        if (pinnedIds.includes(id)) {
          set({ pinnedIds: pinnedIds.filter((item) => item !== id) });
          return true;
        }

        if (pinnedIds.length >= MAX_PINNED_MOBILE_NAV) {
          return false;
        }

        set({ pinnedIds: [...pinnedIds, id] });
        return true;
      },

      isPinned: (id) => get().pinnedIds.includes(id),

      resetToDefault: () => {
        set({ pinnedIds: [] });
      },
    }),
    {
      name: V2_MOBILE_NAV_STORAGE_KEY,
    },
  ),
);
