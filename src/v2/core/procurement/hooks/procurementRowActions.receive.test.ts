import { describe, expect, it, vi } from "vitest";
import { buildProcurementRowActions } from "./procurementRowActions.builder";
import type { ProcurementListConfig } from "./procurementListConfig.type";

interface Row {
  id: string;
  status: string;
  fulfillmentStatus: string;
}

const config: ProcurementListConfig<Row> = {
  api: {} as ProcurementListConfig<Row>["api"],
  queryKey: "test",
  permissionCollection: "po",
  availableActions: () => [],
  isEditable: () => false,
  rowLabel: (row) => row.id,
  receiveHref: "/garage-goods-receipts",
  canReceive: (row) =>
    row.status === "ISSUED" && row.fulfillmentStatus !== "FULL",
  receiveBlockedKey: (row) => {
    if (row.status !== "ISSUED") return "notIssued";
    if (row.fulfillmentStatus === "FULL") return "fullyReceived";
    return null;
  },
};

const build = (receive = vi.fn()) =>
  buildProcurementRowActions<Row>({
    t: (_key, fallback) => fallback,
    config,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    openDrawer: vi.fn(),
    start: vi.fn(),
    openDelete: vi.fn(),
    orderFromRequest: vi.fn(),
    canReceive: true,
    receive,
  });

const findReceive = (row: Row) =>
  build()(row)
    .flatMap((group) => group.items)
    .find((item) => item.label === "Nhập kho");

describe("hành động Nhập kho trong menu đơn mua", () => {
  it("bật khi đơn đã phát hành và chưa nhận đủ, bấm thì gọi receive", () => {
    const receive = vi.fn();
    const row = { id: "po-1", status: "ISSUED", fulfillmentStatus: "PARTIAL" };
    const item = build(receive)(row)
      .flatMap((group) => group.items)
      .find((i) => i.label === "Nhập kho");
    expect(item?.disabled).toBe(false);
    item?.onClick();
    expect(receive).toHaveBeenCalledWith(row);
  });

  it("mờ kèm lý do khi đơn chưa phát hành", () => {
    const item = findReceive({
      id: "po-2",
      status: "APPROVED",
      fulfillmentStatus: "NONE",
    });
    expect(item?.disabled).toBe(true);
    expect(item?.disabledReason).toBe("Chỉ nhập kho khi đơn mua đã phát hành");
  });

  it("mờ kèm lý do khi đơn đã nhận đủ", () => {
    const item = findReceive({
      id: "po-3",
      status: "ISSUED",
      fulfillmentStatus: "FULL",
    });
    expect(item?.disabled).toBe(true);
    expect(item?.disabledReason).toBe("Đơn mua đã nhận đủ hàng");
  });
});
