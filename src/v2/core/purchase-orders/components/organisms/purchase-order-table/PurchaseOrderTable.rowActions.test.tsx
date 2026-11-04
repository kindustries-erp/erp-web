import { describe, expect, it, vi } from "vitest";
import { PurchaseOrderStatus } from "../../../domain/purchaseOrderConstants";
import type { PurchaseOrderRecord } from "../../../domain/purchaseOrder";
import { buildPurchaseOrderRowActions } from "./PurchaseOrderTable.rowActions";

const t = (_key: string, fallback?: string) => fallback ?? "";
const rowOf = (status: PurchaseOrderStatus) =>
  ({ id: "p1", poNo: "GPO-1", status }) as PurchaseOrderRecord;

const labelsOf = (
  groups: ReturnType<ReturnType<typeof buildPurchaseOrderRowActions>>,
) => groups.flatMap((group) => group.items.map((item) => item.label));

const build = (
  status: PurchaseOrderStatus,
  perms: { canUpdate: boolean; canDelete: boolean },
) =>
  buildPurchaseOrderRowActions({
    t,
    ...perms,
    open: vi.fn(),
    onDelete: vi.fn(),
  })(rowOf(status));

describe("buildPurchaseOrderRowActions", () => {
  it("nháp có đủ xem, sửa, xóa khi có quyền", () => {
    const actions = build(PurchaseOrderStatus.DRAFT, {
      canUpdate: true,
      canDelete: true,
    });
    expect(labelsOf(actions)).toEqual(["Xem chi tiết", "Chỉnh sửa", "Xóa"]);
  });

  it("đã duyệt: có sửa nhưng không có xóa", () => {
    const actions = build(PurchaseOrderStatus.APPROVED, {
      canUpdate: true,
      canDelete: true,
    });
    expect(labelsOf(actions)).toEqual(["Xem chi tiết", "Chỉnh sửa"]);
  });

  it("đã nhận đủ hoặc đã hủy: chỉ còn xem", () => {
    expect(
      labelsOf(
        build(PurchaseOrderStatus.RECEIVED, {
          canUpdate: true,
          canDelete: true,
        }),
      ),
    ).toEqual(["Xem chi tiết"]);
    expect(
      labelsOf(
        build(PurchaseOrderStatus.CANCELLED, {
          canUpdate: true,
          canDelete: true,
        }),
      ),
    ).toEqual(["Xem chi tiết"]);
  });

  it("không có quyền thì không có sửa và xóa dù đang nháp", () => {
    const actions = build(PurchaseOrderStatus.DRAFT, {
      canUpdate: false,
      canDelete: false,
    });
    expect(labelsOf(actions)).toEqual(["Xem chi tiết"]);
  });

  it("gọi đúng callback khi bấm sửa và xóa", () => {
    const open = vi.fn();
    const onDelete = vi.fn();
    const actions = buildPurchaseOrderRowActions({
      t,
      canUpdate: true,
      canDelete: true,
      open,
      onDelete,
    })(rowOf(PurchaseOrderStatus.DRAFT));

    actions[0].items[1].onClick();
    expect(open).toHaveBeenCalledWith("p1", "edit");
    actions[0].items[2].onClick();
    expect(onDelete).toHaveBeenCalledWith(rowOf(PurchaseOrderStatus.DRAFT));
  });
});
