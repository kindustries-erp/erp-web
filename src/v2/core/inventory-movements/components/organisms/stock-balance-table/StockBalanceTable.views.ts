/** Chế độ xem hệ thống của bảng tồn kho: cột hiển thị cho từng view */
export const stockBalanceViewVisibility = {
  overview: {
    itemCode: true,
    itemName: true,
    unit: false,
    qtyReceived: true,
    qtyIssued: true,
    qtyAdjusted: true,
    qtyOnHand: true,
    avgCost: false,
    inventoryValue: true,
  },
  all: {
    itemCode: true,
    itemName: true,
    unit: true,
    qtyReceived: true,
    qtyIssued: true,
    qtyAdjusted: true,
    qtyOnHand: true,
    avgCost: true,
    inventoryValue: true,
  },
} as const;
