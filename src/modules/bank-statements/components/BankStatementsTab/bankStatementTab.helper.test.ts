import { describe, expect, it } from "vitest";
import { readBankStatementTab } from "./bankStatementTab.helper";

describe("readBankStatementTab", () => {
  it("đọc tab hợp lệ từ đường dẫn có query", () => {
    expect(readBankStatementTab("/cashflow?tab=cash")).toBe("cash");
    expect(readBankStatementTab("/cashflow?_i=2&tab=bank")).toBe("bank");
  });

  it("trả về null khi thiếu hoặc sai tab", () => {
    expect(readBankStatementTab("/cashflow")).toBeNull();
    expect(readBankStatementTab("/cashflow?tab=unknown")).toBeNull();
    expect(readBankStatementTab(undefined)).toBeNull();
    expect(readBankStatementTab(null)).toBeNull();
  });
});
