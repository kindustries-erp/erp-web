import { describe, expect, it } from "vitest";
import { hasStatusField, parseFields } from "./v2Fields.mjs";

describe("parseFields", () => {
  it("parses name, type and required flag", () => {
    expect(parseFields("code:string:required,phone:string")).toEqual([
      { name: "code", type: "string", required: true },
      { name: "phone", type: "string", required: false },
      { name: "createdAt", type: "date", required: false },
    ]);
  });

  it("does not duplicate createdAt when provided", () => {
    const fields = parseFields("name:string,createdAt:date");
    expect(fields.filter((field) => field.name === "createdAt")).toHaveLength(1);
  });

  it("defaults the type to string", () => {
    expect(parseFields("name")[0]).toMatchObject({ name: "name", type: "string" });
  });

  it("rejects unknown types and invalid names", () => {
    expect(() => parseFields("code:boolean")).toThrow(/Kiểu không hợp lệ/);
    expect(() => parseFields("Code:string")).toThrow(/Tên trường không hợp lệ/);
  });

  it("detects a status field", () => {
    expect(hasStatusField(parseFields("status:status"))).toBe(true);
    expect(hasStatusField(parseFields("name:string"))).toBe(false);
  });
});
