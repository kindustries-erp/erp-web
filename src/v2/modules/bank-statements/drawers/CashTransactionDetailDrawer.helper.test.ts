import { describe, expect, it } from "vitest";
import {
  existingInvoiceIdsOf,
  netOffCapacityOf,
} from "./CashTransactionDetailDrawer.helper";
import type { CashTransactionDto } from "../api/dtos/cashTransaction.dto";

const tx = (over: Partial<CashTransactionDto>) =>
  ({
    creditAmount: 0,
    debitAmount: 0,
    invoiceNetOffs: [],
    ...over,
  }) as unknown as CashTransactionDto;

describe("netOffCapacityOf", () => {
  it("lấy số lớn hơn giữa Thu và Chi, trừ các khoản đã cấn trừ", () => {
    expect(
      netOffCapacityOf(
        tx({
          creditAmount: 1000,
          invoiceNetOffs: [{ id: "n1", netOffAmount: 300 } as never],
        }),
      ),
    ).toBe(700);
  });

  it("không âm khi đã cấn trừ quá số tiền", () => {
    expect(
      netOffCapacityOf(
        tx({
          debitAmount: 100,
          invoiceNetOffs: [{ id: "n1", netOffAmount: 150 } as never],
        }),
      ),
    ).toBe(0);
  });
});

describe("existingInvoiceIdsOf", () => {
  it("lấy mã hóa đơn từ invoiceId hoặc invoice.id, bỏ mục rỗng", () => {
    const ids = existingInvoiceIdsOf(
      tx({
        invoiceNetOffs: [
          { id: "n1", invoiceId: "i1" } as never,
          { id: "n2", invoice: { id: "i2" } } as never,
          { id: "n3" } as never,
        ],
      }),
    );
    expect(ids).toEqual(["i1", "i2"]);
  });
});
