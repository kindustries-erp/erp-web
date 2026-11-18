import { describe, expect, it } from "vitest";
import {
  resolveGarageAddLink,
  resolveGarageUnlink,
} from "./garageCaseTraceability.actions";

const n = (id: string, docType: string) => ({ id, docType }) as never;

describe("resolveGarageAddLink", () => {
  it.each([
    [undefined, "INVOICE", "ADD_INVOICE"],
    ["INVOICE", undefined, "ADD_INVOICE"],
    [undefined, "PURCHASE_ORDER", "PO_UNSUPPORTED"],
    ["ORDER_STOCK", undefined, "PO_UNSUPPORTED"],
    [undefined, "SALES_ORDER", "SO_UNSUPPORTED"],
    ["PAYMENT", undefined, "ADD_SETTLEMENT"],
    [undefined, undefined, "ADD_SETTLEMENT"],
  ])("%s / %s → %s", (stage, doc, expected) => {
    expect(resolveGarageAddLink(stage as never, doc as never)).toBe(expected);
  });
});

describe("resolveGarageUnlink", () => {
  it("gỡ hóa đơn đang gắn", () => {
    expect(
      resolveGarageUnlink(n("i1", "INVOICE"), [], [{ invoiceId: "i1" }]),
    ).toEqual({ kind: "INVOICE", id: "i1" });
  });
  it("gỡ khoản thu/chi theo id node thủ công và theo giao dịch ngân hàng", () => {
    const s = [{ id: "s1" }, { id: "s2", bank_transaction_id: "bt" }];
    expect(resolveGarageUnlink(n("manual-s1", "BANK_TXN"), s, [])).toEqual({
      kind: "SETTLEMENT",
      id: "s1",
    });
    expect(resolveGarageUnlink(n("bt", "BANK_TXN"), s, [])).toEqual({
      kind: "SETTLEMENT",
      id: "s2",
    });
  });
  it("trả null cho node không gỡ được", () => {
    expect(resolveGarageUnlink(n("p", "PURCHASE_ORDER"), [], [])).toBeNull();
    expect(resolveGarageUnlink(n("x", "INVOICE"), [], [])).toBeNull();
  });
});
