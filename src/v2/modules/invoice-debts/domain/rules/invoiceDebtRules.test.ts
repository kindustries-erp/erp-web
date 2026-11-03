import { describe, expect, it } from "vitest";
import { emptyInvoiceDebtForm } from "../entities/invoiceDebt";
import {
  isInvoiceDebtFormDirty,
  REQUIRED_invoiceDebt_FIELDS,
  validateInvoiceDebtForm,
} from "./invoiceDebtRules";

describe("validateInvoiceDebtForm", () => {
  it("reports the first blank required field", () => {
    expect(validateInvoiceDebtForm(emptyInvoiceDebtForm())).toBe(
      REQUIRED_invoiceDebt_FIELDS[0],
    );
  });

  it("accepts a form with every required field filled", () => {
    const form = {
      ...emptyInvoiceDebtForm(),
      search: "x",
    };
    expect(validateInvoiceDebtForm(form)).toBeNull();
  });
});

describe("isInvoiceDebtFormDirty", () => {
  it("detects changes against the initial snapshot", () => {
    const initial = emptyInvoiceDebtForm();
    expect(isInvoiceDebtFormDirty({ ...initial }, initial)).toBe(false);
    expect(isInvoiceDebtFormDirty({ ...initial, search: "x" }, initial)).toBe(
      true,
    );
  });
});
