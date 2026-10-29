import { describe, it, expect } from "vitest";
import { erpInvoicesVi } from "./index";
import { erpInvoicesViPage } from "./page";
import { erpInvoicesViActions } from "./actions";
import { erpInvoicesViBulk } from "./bulk";
import { erpInvoicesViSettlement } from "./settlement";
import { erpInvoicesViNetoff } from "./netoff";
import { erpInvoicesViLookup } from "./lookup";
import { erpInvoicesViDrawers } from "./drawers";

const PARTS = [
  erpInvoicesViPage,
  erpInvoicesViActions,
  erpInvoicesViBulk,
  erpInvoicesViSettlement,
  erpInvoicesViNetoff,
  erpInvoicesViLookup,
  erpInvoicesViDrawers,
];

describe("erpInvoicesVi locale parts", () => {
  it("keeps every key in exactly one part (spread would silently override duplicates)", () => {
    const seen = new Map<string, number>();
    for (const part of PARTS) {
      for (const key of Object.keys(part)) {
        seen.set(key, (seen.get(key) ?? 0) + 1);
      }
    }
    const duplicates = [...seen].filter(([, n]) => n > 1).map(([k]) => k);
    expect(duplicates).toEqual([]);
  });

  it("merges to the expected number of keys", () => {
    const total = PARTS.reduce(
      (sum, part) => sum + Object.keys(part).length,
      0,
    );
    expect(Object.keys(erpInvoicesVi)).toHaveLength(total);
    expect(total).toBe(580);
  });
});
