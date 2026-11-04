import { describe, expect, it, vi } from "vitest";
import type { GoodsReceiptRecord } from "../../../domain/goodsReceipt";
import { buildGoodsReceiptRowActions } from "./GoodsReceiptTable.rowActions";

const t = (_key: string, fallback?: string) => fallback ?? "";
const row = { id: "r1", receiptNo: "GGR-1" } as GoodsReceiptRecord;

const labelsOf = (
  groups: ReturnType<ReturnType<typeof buildGoodsReceiptRowActions>>,
) => groups.flatMap((group) => group.items.map((item) => item.label));

describe("buildGoodsReceiptRowActions", () => {
  it("chỉ hiện xem khi không có quyền sửa và xóa", () => {
    const actions = buildGoodsReceiptRowActions({
      t,
      canUpdate: false,
      canDelete: false,
      open: vi.fn(),
      onDelete: vi.fn(),
    })(row);
    expect(labelsOf(actions)).toEqual(["Xem chi tiết"]);
  });

  it("thêm sửa và xóa theo quyền, và gọi đúng callback", () => {
    const open = vi.fn();
    const onDelete = vi.fn();
    const actions = buildGoodsReceiptRowActions({
      t,
      canUpdate: true,
      canDelete: true,
      open,
      onDelete,
    })(row);

    expect(labelsOf(actions)).toEqual(["Xem chi tiết", "Chỉnh sửa", "Xóa"]);
    actions[0].items[2].onClick();
    expect(onDelete).toHaveBeenCalledWith(row);
    actions[0].items[1].onClick();
    expect(open).toHaveBeenCalledWith("r1", "edit");
  });
});
