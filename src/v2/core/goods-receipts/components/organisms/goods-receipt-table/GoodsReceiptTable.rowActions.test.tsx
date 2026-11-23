import { describe, expect, it, vi } from "vitest";
import {
  GoodsReceiptStatus,
  type GoodsReceiptRecord,
} from "../../../domain/goodsReceipt";
import { buildGoodsReceiptRowActions } from "./GoodsReceiptTable.rowActions";

const t = (_key: string, fallback?: string) => fallback ?? "";
const draft = {
  id: "r1",
  receiptNo: "GGR-1",
  status: GoodsReceiptStatus.DRAFT,
} as GoodsReceiptRecord;
const posted = {
  id: "r2",
  receiptNo: "GGR-2",
  status: GoodsReceiptStatus.POSTED,
} as GoodsReceiptRecord;

const labelsOf = (
  groups: ReturnType<ReturnType<typeof buildGoodsReceiptRowActions>>,
) =>
  groups.map((group) => ({
    group: group.groupLabel,
    items: group.items.map((item) => item.label),
  }));

describe("buildGoodsReceiptRowActions", () => {
  it("không có quyền sửa và xóa: chỉ còn nhóm Tra cứu", () => {
    const groups = buildGoodsReceiptRowActions({
      t,
      canUpdate: false,
      canDelete: false,
      open: vi.fn(),
      onDelete: vi.fn(),
    })(draft);
    expect(labelsOf(groups)).toEqual([
      { group: "Tra cứu", items: ["Xem chi tiết"] },
    ]);
  });

  it("phiếu nháp có quyền: Thao tác gồm Chỉnh sửa đứng đầu rồi Xóa, và gọi đúng callback", () => {
    const open = vi.fn();
    const onDelete = vi.fn();
    const groups = buildGoodsReceiptRowActions({
      t,
      canUpdate: true,
      canDelete: true,
      open,
      onDelete,
    })(draft);

    expect(labelsOf(groups)).toEqual([
      { group: "Tra cứu", items: ["Xem chi tiết"] },
      { group: "Thao tác", items: ["Chỉnh sửa", "Xóa"] },
    ]);
    groups[1].items[0].onClick();
    expect(open).toHaveBeenCalledWith("r1", "edit");
    groups[1].items[1].onClick();
    expect(onDelete).toHaveBeenCalledWith(draft);
  });

  it("phiếu đã ghi sổ: Chỉnh sửa vẫn hiện nhưng mờ kèm lý do, không có Xóa", () => {
    const groups = buildGoodsReceiptRowActions({
      t,
      canUpdate: true,
      canDelete: true,
      open: vi.fn(),
      onDelete: vi.fn(),
    })(posted);
    expect(labelsOf(groups)).toEqual([
      { group: "Tra cứu", items: ["Xem chi tiết"] },
      { group: "Thao tác", items: ["Chỉnh sửa"] },
    ]);
    expect(groups[1].items[0].disabled).toBe(true);
    expect(groups[1].items[0].disabledReason).toBe("Chỉ sửa được khi còn nháp");
  });
});
