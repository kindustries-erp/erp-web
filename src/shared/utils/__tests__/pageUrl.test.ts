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
      const path = pageToPath("erp-invoices-in", undefined, {
        status: "CONFIRMED",
        _i: "2",
      });
      expect(path).toContain("/erp-invoices-in?");
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
      const res = pathToPage("/erp-invoices-in", "?status=DRAFT&_i=2");
      expect(res).not.toBeNull();
      expect(res?.page).toBe("erp-invoices-in");
      expect(res?.instanceIndex).toBe(2);
    });

    it("defaults to instanceIndex 1 when _i is not 2", () => {
      const res = pathToPage("/erp-invoices-in", "?status=CONFIRMED");
      expect(res?.instanceIndex).toBe(1);
    });
  });
});
