import { FifoUnitRow } from "./useFifoUnitLedger";

export interface FifoDisplayRow {
  id: string;
  isFirstOfGroup: boolean;
  groupId: string; // inInvoiceNo or inLedgerId

  // IN
  inDate?: string;
  inInvoiceNo?: string;
  inInvoiceId?: string;
  inUnitCost?: number;
  inQty?: number;
  inTotal?: number;

  // OUT
  outDate?: string;
  outInvoiceNo?: string;
  outInvoiceId?: string;
  outQty?: number;
  outCogs?: number; // FIFO cost
  outPrice?: number; // Sales revenue per unit
  outRevenue?: number;
  outProfitMargin?: number;

  // BALANCE (Lot)
  lotBalanceQty: number;
  lotBalanceTotal: number;
}

export function buildGroupedRows(rows: FifoUnitRow[]): FifoDisplayRow[] {
  // Group units by inInvoiceNo (or inLedgerId to be safe)
  const groups = new Map<string, FifoUnitRow[]>();

  rows.forEach((r) => {
    const key = r.inInvoiceNo || r.inLedgerId;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(r);
  });

  const displayRows: FifoDisplayRow[] = [];

  // Sort groups by inDate
  const sortedGroupKeys = Array.from(groups.keys()).sort((a, b) => {
    const groupA = groups.get(a)!;
    const groupB = groups.get(b)!;
    return (
      new Date(groupA[0].inDate).getTime() -
      new Date(groupB[0].inDate).getTime()
    );
  });

  sortedGroupKeys.forEach((key) => {
    const units = groups.get(key)!;
    const firstUnit = units[0];

    const inQty = units.reduce((acc, u) => acc + (u.qty || 1), 0);
    const inUnitCost = firstUnit.inUnitCost;
    const inTotal = inQty * inUnitCost;

    // Group the OUTs for this lot by outInvoiceNo
    const outGroups = new Map<string, FifoUnitRow[]>();
    const unsoldUnits: FifoUnitRow[] = [];

    units.forEach((u) => {
      if (u.status === "SOLD" && u.outInvoiceNo) {
        if (!outGroups.has(u.outInvoiceNo)) {
          outGroups.set(u.outInvoiceNo, []);
        }
        outGroups.get(u.outInvoiceNo)!.push(u);
      } else {
        unsoldUnits.push(u);
      }
    });

    // If there are no OUTs, just one row
    if (outGroups.size === 0) {
      displayRows.push({
        id: `${key}-empty`,
        isFirstOfGroup: true,
        groupId: key,
        inDate: firstUnit.inDate,
        inInvoiceNo: firstUnit.inInvoiceNo,
        inInvoiceId: firstUnit.inInvoiceId,
        inUnitCost: inUnitCost,
        inQty: inQty,
        inTotal: inTotal,
        lotBalanceQty: inQty,
        lotBalanceTotal: inTotal,
      });
      return;
    }

    // Sort OUTs chronologically
    const sortedOutKeys = Array.from(outGroups.keys()).sort((a, b) => {
      const outA = outGroups.get(a)!;
      const outB = outGroups.get(b)!;
      return (
        new Date(outA[0].outDate!).getTime() -
        new Date(outB[0].outDate!).getTime()
      );
    });

    let currentBalanceQty = inQty;

    sortedOutKeys.forEach((outKey, index) => {
      const outUnits = outGroups.get(outKey)!;
      const outQty = outUnits.reduce((acc, u) => acc + (u.qty || 1), 0);
      const outFirst = outUnits[0];
      const outCogs = outUnits.reduce(
        (sum, u) => sum + (u.cogsFifo || u.inUnitCost || 0) * (u.qty || 1),
        0,
      );

      currentBalanceQty = Math.round((currentBalanceQty - outQty) * 100) / 100;

      displayRows.push({
        id: `${key}-out-${outKey}`,
        isFirstOfGroup: index === 0,
        groupId: key,

        // IN info (always attach to row for filtering, but UI uses isFirstOfGroup to hide)
        inDate: firstUnit.inDate,
        inInvoiceNo: firstUnit.inInvoiceNo,
        inInvoiceId: firstUnit.inInvoiceId,
        inUnitCost: inUnitCost,
        inQty: inQty,
        inTotal: inTotal,

        // OUT info
        outDate: outFirst.outDate,
        outInvoiceNo: outFirst.outInvoiceNo,
        outInvoiceId: outFirst.outInvoiceId,
        outQty: outQty,
        outCogs: outCogs,
        outPrice: outFirst.outPrice,
        outRevenue:
          outFirst.outPrice != null ? outQty * outFirst.outPrice : undefined,
        outProfitMargin:
          outFirst.outPrice != null && outFirst.outPrice * outQty > 0
            ? ((outQty * outFirst.outPrice - outCogs) /
                (outQty * outFirst.outPrice)) *
              100
            : undefined,

        // Balance
        lotBalanceQty: currentBalanceQty,
        lotBalanceTotal: currentBalanceQty * inUnitCost,
      });
    });
  });

  return displayRows;
}
