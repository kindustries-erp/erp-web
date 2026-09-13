import { describe, expect, it } from "vitest";
import {
  pageToPath,
  pathToPage,
  encodeStateParam,
  decodeStateParam,
} from "./pageUrl";

describe("pageUrl with report dashboards", () => {
  it("serializes sales report dashboard path", () => {
    expect(pageToPath("sales-report-dashboard")).toBe(
      "/sales-report-dashboard",
    );
  });

  it("serializes purchasing report dashboard path", () => {
    expect(pageToPath("purchasing-report-dashboard")).toBe(
      "/purchasing-report-dashboard",
    );
  });

  it("parses sales report dashboard from pathname", () => {
    expect(pathToPage("/sales-report-dashboard", "")).toEqual({
      page: "sales-report-dashboard",
      tab: undefined,
      instanceIndex: 1,
      searchParams: expect.any(URLSearchParams),
    });
  });

  it("parses purchasing report dashboard from pathname", () => {
    expect(pathToPage("/purchasing-report-dashboard", "")).toEqual({
      page: "purchasing-report-dashboard",
      tab: undefined,
      instanceIndex: 1,
      searchParams: expect.any(URLSearchParams),
    });
  });

  it("serializes and parses /opex correctly", () => {
    expect(pageToPath("opex")).toBe("/opex");
    expect(pathToPage("/opex", "")).toEqual({
      page: "opex",
      tab: undefined,
      instanceIndex: 1,
      searchParams: expect.any(URLSearchParams),
    });
  });

  it("returns null (404) when accessing deprecated /budget path", () => {
    expect(pathToPage("/budget", "")).toBeNull();
  });
});

describe("encodeStateParam & decodeStateParam (Compact Human-Readable URL Format)", () => {
  it("encodes and decodes columnFilters compact format", () => {
    const filters = {
      status: ["CONFIRMED", "PENDING"],
      direction: ["IN"],
    };
    const encoded = encodeStateParam(filters);
    expect(encoded).toBe("status:[CONFIRMED,PENDING]|direction:[IN]");

    const decoded = decodeStateParam<Record<string, string[]>>(encoded);
    expect(decoded).toEqual({
      status: ["CONFIRMED", "PENDING"],
      direction: ["IN"],
    });
  });

  it("encodes and decodes columnSearch compact format", () => {
    const search = {
      sellerName: "VinFast",
      invoiceNo: "10566",
    };
    const encoded = encodeStateParam(search);
    expect(encoded).toBe("sellerName:VinFast|invoiceNo:10566");

    const decoded = decodeStateParam<Record<string, string>>(encoded);
    expect(decoded).toEqual({
      sellerName: "VinFast",
      invoiceNo: "10566",
    });
  });

  it("encodes and decodes sorts compact format", () => {
    const sorts = ["-invoiceDate", "invoiceNo"];
    const encoded = encodeStateParam(sorts);
    expect(encoded).toBe("-invoiceDate,invoiceNo");

    const decoded = decodeStateParam<string[]>(encoded);
    expect(decoded).toEqual(["-invoiceDate", "invoiceNo"]);
  });

  it("backward-compatible: decodes legacy Base64 state payload", () => {
    const legacyBase64 = "eyJzdGF0dXMiOlsiQ09ORklSTUVEIl19";
    const decoded = decodeStateParam<{ status: string[] }>(legacyBase64);
    expect(decoded).toEqual({ status: ["CONFIRMED"] });
  });

  it("backward-compatible: decodes JSON string payload", () => {
    const jsonStr = '{"buyerTaxCode":["0318334886-003"]}';
    const decoded = decodeStateParam<{ buyerTaxCode: string[] }>(jsonStr);
    expect(decoded).toEqual({ buyerTaxCode: ["0318334886-003"] });
  });

  it("encodes and decodes Vietnamese unicode text without double URL encoding", () => {
    const filters = {
      partner: [
        "CHI NHÁNH THÀNH PHỐ HỒ CHÍ MINH CÔNG TY TNHH THIẾT BỊ ĐIỆN TỬ",
      ],
    };
    const encoded = encodeStateParam(filters);
    expect(encoded).toBe(
      "partner:[CHI NHÁNH THÀNH PHỐ HỒ CHÍ MINH CÔNG TY TNHH THIẾT BỊ ĐIỆN TỬ]",
    );

    // Khi đưa vào URLSearchParams
    const params = new URLSearchParams();
    params.set("cf", encoded);
    const searchString = params.toString();
    // Không được chứa double encoded '%2520' hoặc '%25C3'
    expect(searchString).not.toContain("%2520");
    expect(searchString).not.toContain("%25C3");

    // Khi đọc lại từ URLSearchParams
    const readParam = params.get("cf");
    expect(readParam).toBe(encoded);

    const decoded = decodeStateParam<Record<string, string[]>>(readParam || "");
    expect(decoded).toEqual(filters);
  });

  it("handles empty values gracefully", () => {
    expect(encodeStateParam(null)).toBe("");
    expect(encodeStateParam({})).toBe("");
    expect(encodeStateParam([])).toBe("");
    expect(decodeStateParam("")).toBeNull();
  });
});
