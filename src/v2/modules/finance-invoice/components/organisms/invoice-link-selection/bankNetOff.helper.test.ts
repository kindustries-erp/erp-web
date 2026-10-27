import { describe, expect, it } from "vitest";
import {
  buildNetOffItems,
  clampAmount,
  grossAmount,
  matchesSide,
  remainingOf,
  sumSelected,
  toAmount,
} from "./bankNetOff.helper";
import type { BankTransactionLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";

const txn = (
  over: Partial<BankTransactionLinkDto> = {},
): BankTransactionLinkDto => ({
  id: "t1",
  debitAmount: "0",
  creditAmount: "0",
  netOffAmount: "0",
  ...over,
});

describe("bankNetOff helpers", () => {
  it("reads amounts sent as strings or numbers", () => {
    expect(toAmount("1500000.50")).toBe(1500000.5);
    expect(toAmount(200)).toBe(200);
    expect(toAmount(null)).toBe(0);
    expect(toAmount("abc")).toBe(0);
  });

  it("uses debit as the gross amount when present, otherwise credit", () => {
    expect(grossAmount(txn({ debitAmount: "300" }))).toBe(300);
    expect(grossAmount(txn({ creditAmount: "700" }))).toBe(700);
  });

  it("matches payments by debit and receipts by credit", () => {
    expect(matchesSide(txn({ debitAmount: "1" }), "PAYMENT")).toBe(true);
    expect(matchesSide(txn({ creditAmount: "1" }), "PAYMENT")).toBe(false);
    expect(matchesSide(txn({ creditAmount: "1" }), "RECEIPT")).toBe(true);
  });

  it("returns what is still open after earlier net-offs", () => {
    expect(remainingOf(txn({ debitAmount: "1000", netOffAmount: "400" }))).toBe(
      600,
    );
    expect(remainingOf(txn({ debitAmount: "100", netOffAmount: "400" }))).toBe(
      0,
    );
  });

  it("clamps an entered amount to the allowed range", () => {
    expect(clampAmount(900, 600)).toBe(600);
    expect(clampAmount(-5, 600)).toBe(0);
    expect(clampAmount(250, 600)).toBe(250);
  });

  it("builds the submitted items and drops zero amounts", () => {
    const selected = {
      a: { txn: txn({ id: "a" }), amount: 100 },
      b: { txn: txn({ id: "b" }), amount: 0 },
    };
    expect(buildNetOffItems(selected)).toEqual([{ id: "a", amount: 100 }]);
    expect(sumSelected(selected)).toBe(100);
  });
});
