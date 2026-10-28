import type { LedgerRow } from "../useFifoUnitLedger";

/**
 * Dữ liệu mẫu cho test đặc tả: có nhập, bán, hàng trả và bán vượt tồn.
 * Số liệu lũy kế được tính bằng đúng engine phía API để giữ nhất quán.
 * Dùng cho test snapshot trước và sau khi tách component.
 */
export function buildFifoFixtureRows(): LedgerRow[] {
  const raw = [
    {
      id: "in-1",
      direction: "IN" as const,
      qty: "10",
      unitCost: "100",
      preVatAmount: "1000",
      transactionDate: "2026-06-01T12:00:00",
      isAdjustment: false,
      adjSign: 1,
      invoiceId: "inv-in-1",
      invoiceNo: "HD-IN-001",
      invoiceDate: "2026-06-01",
      buyerName: "",
      sellerName: "CONG TY NCC A",
      sellerTaxCode: "0318334886",
      licensePlate: "",
    },
    {
      id: "out-1",
      direction: "OUT" as const,
      qty: "4",
      unitCost: "0",
      preVatAmount: "800",
      transactionDate: "2026-06-05T12:00:00",
      isAdjustment: false,
      adjSign: 1,
      invoiceId: "inv-out-1",
      invoiceNo: "HD-OUT-001",
      invoiceDate: "2026-06-05",
      buyerName: "KHACH B",
      sellerName: "",
      buyerTaxCode: "0100000001",
      licensePlate: "51A-12345",
    },
    {
      id: "ret-1",
      direction: "OUT" as const,
      qty: "1",
      unitCost: "0",
      preVatAmount: "150",
      transactionDate: "2026-06-07T12:00:00",
      isAdjustment: true,
      adjSign: -1,
      invoiceId: "inv-ret-1",
      invoiceNo: "HD-RET-001",
      invoiceDate: "2026-06-07",
      buyerName: "KHACH B",
      sellerName: "",
      buyerTaxCode: "0100000001",
      licensePlate: "",
    },
    {
      id: "out-2",
      direction: "OUT" as const,
      qty: "9",
      unitCost: "0",
      preVatAmount: "1350",
      transactionDate: "2026-06-09T12:00:00",
      isAdjustment: false,
      adjSign: 1,
      invoiceId: "inv-out-2",
      invoiceNo: "HD-OUT-002",
      invoiceDate: "2026-06-09",
      buyerName: "KHACH C",
      sellerName: "",
      buyerTaxCode: "0100000002",
      licensePlate: "",
    },
  ];

  // Số liệu lũy kế theo engine: nhập 10@100; bán 4 (giá vốn 400); trả 1 (giá vốn -100);
  // bán 9 chỉ còn 7 trong kho nên thiếu 2 (giá vốn 700, tồn -2).
  const metrics: Record<
    string,
    Pick<
      LedgerRow,
      | "calculatedCogs"
      | "calculatedUnitCost"
      | "balanceQty"
      | "balanceValue"
      | "shortageQty"
    >
  > = {
    "in-1": { balanceQty: 10, balanceValue: 1000, shortageQty: 0 },
    "out-1": {
      calculatedCogs: 400,
      calculatedUnitCost: 100,
      balanceQty: 6,
      balanceValue: 600,
      shortageQty: 0,
    },
    "ret-1": {
      calculatedCogs: -100,
      calculatedUnitCost: 100,
      balanceQty: 7,
      balanceValue: 700,
      shortageQty: 0,
    },
    "out-2": {
      calculatedCogs: 700,
      calculatedUnitCost: 700 / 9,
      balanceQty: -2,
      balanceValue: 0,
      shortageQty: 2,
    },
  };

  return raw.map((r) => ({ ...r, ...metrics[r.id] })) as unknown as LedgerRow[];
}
