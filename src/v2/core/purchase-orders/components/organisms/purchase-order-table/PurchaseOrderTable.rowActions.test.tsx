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

const handlers = () => ({
  open: vi.fn(),
  onApprove: vi.fn(),
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  onDelete: vi.fn(),
});

const build = (
  status: PurchaseOrderStatus,
  perms: { canUpdate: boolean; canDelete: boolean },
) =>
  buildPurchaseOrderRowActions({
    t,
    ...perms,
    ...handlers(),
  })(rowOf(status));

describe("buildPurchaseOrderRowActions", () => {
  it("nháp có xem, sửa, lưu, xác nhận, xóa khi có quyền (chưa có hủy)", () => {
    const actions = build(PurchaseOrderStatus.DRAFT, {
      canUpdate: true,
      canDelete: true,
    });
    expect(labelsOf(actions)).toEqual([
      "Xem chi tiết",
      "Chỉnh sửa",
      "Lưu",
      "Xác nhận đơn",
      "Xóa",
    ]);
  });

  it("chia hai nhóm TRA CỨU và THAO TÁC, mục đầu của THAO TÁC là Chỉnh sửa", () => {
    const actions = build(PurchaseOrderStatus.DRAFT, {
      canUpdate: true,
      canDelete: true,
    });
    expect(actions.map((group) => group.groupLabel)).toEqual([
      "Tra cứu",
      "Thao tác",
    ]);
    expect(actions[1].items[0].label).toBe("Chỉnh sửa");
  });

  it("đã duyệt: không còn Lưu, không có xóa; còn sửa, xác nhận, hủy", () => {
    const actions = build(PurchaseOrderStatus.APPROVED, {
      canUpdate: true,
      canDelete: true,
    });
    expect(labelsOf(actions)).toEqual([
      "Xem chi tiết",
      "Chỉnh sửa",
      "Xác nhận đơn",
      "Hủy đơn",
    ]);
  });

  it("đã nhận đủ hoặc đã hủy: Chỉnh sửa mờ, không có mục ghi khác", () => {
    const received = build(PurchaseOrderStatus.RECEIVED, {
      canUpdate: true,
      canDelete: true,
    });
    expect(received.map((group) => group.groupLabel)).toEqual([
      "Tra cứu",
      "Thao tác",
    ]);
    expect(labelsOf(received)).toEqual(["Xem chi tiết", "Chỉnh sửa"]);
    expect(received[1].items[0].disabled).toBe(true);
    expect(received[1].items[0].disabledReason).toBe(
      "Trạng thái hiện tại không cho phép sửa",
    );
    const cancelled = build(PurchaseOrderStatus.CANCELLED, {
      canUpdate: true,
      canDelete: true,
    });
    expect(labelsOf(cancelled)).toEqual(["Xem chi tiết", "Chỉnh sửa"]);
    expect(cancelled[1].items[0].disabled).toBe(true);
  });

  it("không có quyền cập nhật thì không có mục ghi, chỉ còn xem; xóa cần quyền xóa", () => {
    const noUpdate = build(PurchaseOrderStatus.DRAFT, {
      canUpdate: false,
      canDelete: false,
    });
    expect(labelsOf(noUpdate)).toEqual(["Xem chi tiết"]);

    const deleteOnly = build(PurchaseOrderStatus.DRAFT, {
      canUpdate: false,
      canDelete: true,
    });
    expect(labelsOf(deleteOnly)).toEqual(["Xem chi tiết", "Xóa"]);
  });

  it("gọi đúng callback theo từng mục", () => {
    const h = handlers();
    const actions = buildPurchaseOrderRowActions({
      t,
      canUpdate: true,
      canDelete: true,
      ...h,
    })(rowOf(PurchaseOrderStatus.DRAFT));
    const operate = actions[1].items;

    operate[0].onClick();
    expect(h.open).toHaveBeenCalledWith("p1", "edit");
    operate[1].onClick();
    expect(h.onApprove).toHaveBeenCalledWith(rowOf(PurchaseOrderStatus.DRAFT));
    operate[2].onClick();
    expect(h.onConfirm).toHaveBeenCalledWith(rowOf(PurchaseOrderStatus.DRAFT));
    operate[3].onClick();
    expect(h.onDelete).toHaveBeenCalledWith(rowOf(PurchaseOrderStatus.DRAFT));
  });

  it("đã duyệt: mục Hủy đơn gọi onCancel với đúng dòng", () => {
    const h = handlers();
    const actions = buildPurchaseOrderRowActions({
      t,
      canUpdate: true,
      canDelete: true,
      ...h,
    })(rowOf(PurchaseOrderStatus.APPROVED));
    const cancelItem = actions[1].items.find((i) => i.label === "Hủy đơn");
    cancelItem?.onClick();
    expect(h.onCancel).toHaveBeenCalledWith(
      rowOf(PurchaseOrderStatus.APPROVED),
    );
  });
});
