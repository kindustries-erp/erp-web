import { describe, it, expect } from "vitest";
import { shouldShowLookupAction } from "./lookupAction.helper";

describe("shouldShowLookupAction", () => {
  it("shows for a purchase invoice without any PDF", () => {
    expect(shouldShowLookupAction("IN", { pdfFileKey: null }, false)).toBe(
      true,
    );
  });

  it("hides for a sales invoice", () => {
    expect(shouldShowLookupAction("OUT", { pdfFileKey: null }, false)).toBe(
      false,
    );
  });

  it("hides when the invoice already has a PDF", () => {
    expect(shouldShowLookupAction("IN", { pdfFileKey: "k" }, false)).toBe(
      false,
    );
    expect(shouldShowLookupAction("IN", { pdfFileKey: null }, true)).toBe(
      false,
    );
  });
});
