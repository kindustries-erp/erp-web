import { describe, expect, it } from "vitest";
import {
  LOANS_TOOL_PATH,
  PUBLIC_LOANS_TOOL_PATH,
  pageToPath,
  pathToPage,
  encodeStateParam,
  decodeStateParam,
} from "./pageUrl";

describe("URL khoản vay (loans-tool)", () => {
  it("LOANS_TOOL_PATH là /loans-tool và PUBLIC_LOANS_TOOL_PATH là /public/loans-tool", () => {
    expect(LOANS_TOOL_PATH).toBe("/loans-tool");
    expect(PUBLIC_LOANS_TOOL_PATH).toBe("/public/loans-tool");
  });

  it("pageToPath sinh /loans-tool kèm tab", () => {
    expect(pageToPath("loans", "list")).toBe("/loans-tool?tab=list");
    expect(pageToPath("loans")).toBe("/loans-tool");
  });

  it("pathToPage nhận URL chuẩn, URL public và URL cũ", () => {
    expect(pathToPage("/loans-tool", "?tab=list")?.page).toBe("loans");
    expect(pathToPage("/loans-tool", "?tab=list")?.tab).toBe("list");
    expect(pathToPage("/tools/loans", "")?.page).toBe("loans");
    expect(pathToPage("/loans", "")?.page).toBe("loans");
    expect(pathToPage("/public/loans-tool", "")?.page).toBe("loans");
    expect(pathToPage("/public/loans", "")?.page).toBe("loans");
  });
});

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

  it("serializes and parses /permission correctly", () => {
    expect(pageToPath("permission")).toBe("/permission");
    expect(pageToPath("erp-permissions-core")).toBe("/permission");
    expect(pathToPage("/permission", "")).toEqual({
      page: "permission",
      tab: undefined,
      instanceIndex: 1,
      searchParams: expect.any(URLSearchParams),
    });
    expect(pathToPage("/permissions", "")).toEqual({
      page: "permission",
      tab: undefined,
      instanceIndex: 1,
      searchParams: expect.any(URLSearchParams),
    });
    expect(pathToPage("/erp-permissions-core", "")).toEqual({
      page: "permission",
      tab: undefined,
      instanceIndex: 1,
      searchParams: expect.any(URLSearchParams),
    });
  });

  it("serializes garage-procurement with default tab=requests", () => {
    expect(pageToPath("garage-procurement")).toBe(
      "/garage-procurement?tab=requests",
    );
    expect(pageToPath("garage-procurement", "orders")).toBe(
      "/garage-procurement?tab=orders",
    );
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

describe("URL nhân viên (employees-management)", () => {
  it("URL chuẩn khớp tên module", () => {
    expect(pageToPath("employees-management")).toBe("/employees-management");
    expect(pathToPage("/employees-management", "")?.page).toBe(
      "employees-management",
    );
  });

  it("URL cũ /erp-users của trang V1 vẫn mở trang users V2", () => {
    expect(pathToPage("/erp-users", "")?.page).toBe("users-management");
    expect(pathToPage("/users-management", "")?.page).toBe("users-management");
  });

  it("URL cũ /erp-employees của trang V1 vẫn mở trang mới", () => {
    expect(pathToPage("/erp-employees", "")?.page).toBe("employees-management");
  });
});

describe("file-attachments URL", () => {
  it("/file-attachments là URL chuẩn", () => {
    expect(pathToPage("/file-attachments", "")?.page).toBe("file-attachments");
    expect(pageToPath("file-attachments")).toBe("/file-attachments");
  });
  it("slug module file-attachments-management trỏ về /file-attachments", () => {
    expect(pathToPage("/file-attachments-management", "")?.page).toBe(
      "file-attachments",
    );
  });
  it("/attachments cũ vẫn trỏ về trang file-attachments", () => {
    expect(pathToPage("/attachments", "")?.page).toBe("file-attachments");
  });
});

describe("garage-cases-v2 (dashboard V2)", () => {
  it("pageToPath không tab mặc định ?tab=dashboard", () => {
    expect(pageToPath("garage-cases-v2")).toBe(
      "/garage-cases-v2?tab=dashboard",
    );
  });

  it("/garage-cases-v2 phân tích ra page garage-cases-v2 và tab dashboard", () => {
    const parsed = pathToPage("/garage-cases-v2", "");
    expect(parsed?.page).toBe("garage-cases-v2");
    expect(parsed?.tab).toBe("dashboard");
  });
});
