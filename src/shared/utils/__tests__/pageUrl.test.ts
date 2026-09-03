import { describe, it, expect } from "vitest";
import {
  encodeStateParam,
  decodeStateParam,
  pageToPath,
  pathToPage,
} from "../pageUrl";

describe("pageUrl utilities", () => {
  describe("encodeStateParam & decodeStateParam", () => {
    it("encodes and decodes an object round-trip", () => {
      const original = { status: ["CONFIRMED", "DRAFT"], type: ["STANDARD"] };
      const encoded = encodeStateParam(original);
      expect(typeof encoded).toBe("string");
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = decodeStateParam<typeof original>(encoded);
      expect(decoded).toEqual(original);
    });

    it("returns null or empty for invalid inputs", () => {
      expect(decodeStateParam("invalid-base-64-!!!")).toBeNull();
      expect(decodeStateParam("")).toBeNull();
    });
  });

  describe("pageToPath", () => {
    it("generates correct path for dashboard", () => {
      expect(pageToPath("dashboard")).toBe("/");
    });

    it("generates path with slug and query params", () => {
      const path = pageToPath("erp-invoices", undefined, {
        status: "CONFIRMED",
        _i: "2",
      });
      expect(path).toContain("/erp-invoices?");
      expect(path).toContain("status=CONFIRMED");
      expect(path).toContain("_i=2");
    });
  });

  describe("pathToPage", () => {
    it("parses dashboard path", () => {
      const res = pathToPage("/", "");
      expect(res).toEqual({
        page: "dashboard",
        tab: undefined,
        instanceIndex: 1,
        searchParams: expect.any(URLSearchParams),
      });
    });

    it("parses instanceIndex 2 when _i=2 is present", () => {
      const res = pathToPage("/erp-invoices", "?status=DRAFT&_i=2");
      expect(res).not.toBeNull();
      expect(res?.page).toBe("erp-invoices");
      expect(res?.instanceIndex).toBe(2);
    });

    it("defaults to instanceIndex 1 when _i is not 2", () => {
      const res = pathToPage("/erp-invoices", "?status=CONFIRMED");
      expect(res?.instanceIndex).toBe(1);
    });

    it("handles erp-invoices-out redirect to erp-invoices with tab out", () => {
      const res = pathToPage("/erp-invoices-out", "");
      expect(res?.page).toBe("erp-invoices");
      expect(res?.tab).toBe("out");
    });

    it("handles erp-invoices-out with lines tab redirect to out-lines", () => {
      const res = pathToPage("/erp-invoices-out", "?tab=lines");
      expect(res?.page).toBe("erp-invoices");
      expect(res?.tab).toBe("out-lines");
    });

    it("handles erp-invoices-in legacy redirect to erp-invoices", () => {
      const res = pathToPage("/erp-invoices-in", "");
      expect(res?.page).toBe("erp-invoices");
    });

    it("parses 4-tab values in erp-invoices", () => {
      const inLines = pathToPage("/erp-invoices", "?tab=in-lines");
      expect(inLines?.page).toBe("erp-invoices");
      expect(inLines?.tab).toBe("in-lines");

      const outHeader = pathToPage("/erp-invoices", "?tab=out");
      expect(outHeader?.page).toBe("erp-invoices");
      expect(outHeader?.tab).toBe("out");

      const outLines = pathToPage("/erp-invoices", "?tab=out-lines");
      expect(outLines?.page).toBe("erp-invoices");
      expect(outLines?.tab).toBe("out-lines");

      const legacyLines = pathToPage("/erp-invoices", "?tab=lines");
      expect(legacyLines?.page).toBe("erp-invoices");
      expect(legacyLines?.tab).toBe("in-lines");
    });

    it("parses vinfast-parts-stock page with tab and stock_tab query params", () => {
      const res = pathToPage(
        "/vinfast-parts-stock",
        "?tab=oto&stock_tab=OUT_OF_STOCK",
      );
      expect(res).not.toBeNull();
      expect(res?.page).toBe("vinfast-parts-stock");
      expect(res?.tab).toBe("oto");
      expect(res?.searchParams.get("stock_tab")).toBe("OUT_OF_STOCK");
    });
  });
});
