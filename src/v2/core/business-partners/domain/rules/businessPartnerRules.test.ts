import { describe, expect, it } from "vitest";
import {
  emptyBusinessPartnerForm,
  type BusinessPartnerFormValue,
} from "../entities/businessPartner";
import {
  canEditBusinessPartnerCode,
  isBusinessPartnerFormDirty,
  isBusinessPartnerInactive,
  validateBusinessPartnerForm,
} from "./businessPartnerRules";

const withName = (name: string): BusinessPartnerFormValue => ({
  ...emptyBusinessPartnerForm(),
  name,
});

describe("validateBusinessPartnerForm", () => {
  it("requires a non-blank legal name", () => {
    expect(validateBusinessPartnerForm(withName(""))).toBe("requiredName");
    expect(validateBusinessPartnerForm(withName("   "))).toBe("requiredName");
    expect(validateBusinessPartnerForm(withName("Công ty A"))).toBeNull();
  });
});

describe("isBusinessPartnerFormDirty", () => {
  it("detects changes against the initial snapshot", () => {
    const initial = withName("A");
    expect(isBusinessPartnerFormDirty({ ...initial }, initial)).toBe(false);
    expect(isBusinessPartnerFormDirty(withName("B"), initial)).toBe(true);
  });
});

describe("business partner code and status rules", () => {
  it("locks the code once the partner exists", () => {
    expect(canEditBusinessPartnerCode(true)).toBe(true);
    expect(canEditBusinessPartnerCode(false)).toBe(false);
  });

  it("treats only INACTIVE as inactive", () => {
    expect(isBusinessPartnerInactive("INACTIVE")).toBe(true);
    expect(isBusinessPartnerInactive("ACTIVE")).toBe(false);
  });
});
