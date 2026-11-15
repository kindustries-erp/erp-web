import { describe, expect, it, vi } from "vitest";
import {
  buildGoodsReceiptActions,
  type GoodsReceiptActionsInput,
} from "./GoodsReceiptDrawer.actions";

const base = (over: Partial<GoodsReceiptActionsInput> = {}) =>
  ({
    t: (_k: string, fallback?: string) => fallback ?? _k,
    viewing: false,
    saving: false,
    loading: false,
    posting: false,
    cancelling: false,
    canPost: false,
    canCancel: false,
    canSaveAndPost: true,
    reverseBlocked: false,
    reverseBlockedReason: "Hàng đã xuất",
    onClose: vi.fn(),
    cancelEdit: vi.fn(),
    submit: vi.fn(),
    submitAndPost: vi.fn(),
    post: vi.fn(),
    openReverse: vi.fn(),
    ...over,
  }) as GoodsReceiptActionsInput;

const labels = (i: GoodsReceiptActionsInput) =>
  buildGoodsReceiptActions(i).map((a) => a.label);

describe("buildGoodsReceiptActions", () => {
  it("tạo/sửa: Hủy | Lưu nháp | Nhập kho; Nhập kho là nút chính, gọi lưu + ghi sổ", () => {
    const i = base();
    const actions = buildGoodsReceiptActions(i);
    expect(actions.map((a) => a.label)).toEqual([
      "Hủy",
      "Lưu nháp",
      "Nhập kho",
    ]);
    expect(actions[1].primary).toBeFalsy();
    expect(actions[2].primary).toBe(true);
    actions[2].onClick?.();
    expect(i.submitAndPost).toHaveBeenCalledTimes(1);
    expect(i.submit).not.toHaveBeenCalled();
  });

  it("họ không hỗ trợ lưu và nhập kho: chỉ có Lưu nháp là nút chính", () => {
    const actions = buildGoodsReceiptActions(base({ canSaveAndPost: false }));
    expect(actions.map((a) => a.label)).toEqual(["Hủy", "Lưu nháp"]);
    expect(actions[1].primary).toBe(true);
  });

  it("xem phiếu nháp: Nhập kho + Đóng", () => {
    expect(labels(base({ viewing: true, canPost: true }))).toEqual([
      "Nhập kho",
      "Đóng",
    ]);
  });

  it("phiếu đã nhập kho chỉ còn Hoàn nhập, mờ kèm lý do khi hàng đã dùng", () => {
    const ok = buildGoodsReceiptActions(
      base({ viewing: true, canCancel: true }),
    );
    expect(ok.map((a) => a.label)).toEqual(["Hoàn nhập", "Đóng"]);
    expect(ok[0].disabled).toBe(false);

    const blocked = buildGoodsReceiptActions(
      base({ viewing: true, canCancel: true, reverseBlocked: true }),
    );
    expect(blocked[0].disabled).toBe(true);
    expect(blocked[0].disabledReason).toBe("Hàng đã xuất");
  });
});
