import { describe, it, expect } from "vitest";
import { resolvePublicTool, PUBLIC_TOOLS } from "./publicTools.config";

describe("publicTools.config - resolvePublicTool", () => {
  it("khớp /public/loans-tool (URL chuẩn) khi chưa đăng nhập", () => {
    const tool = resolvePublicTool("/public/loans-tool", false);
    expect(tool).toBeDefined();
    expect(tool?.id).toBe("loans");
  });

  it("khớp các alias /loans-tool, /tools/loans, /loans, /public/loans khi chưa đăng nhập", () => {
    expect(resolvePublicTool("/loans-tool", false)?.id).toBe("loans");
    expect(resolvePublicTool("/tools/loans", false)?.id).toBe("loans");
    expect(resolvePublicTool("/loans", false)?.id).toBe("loans");
    expect(resolvePublicTool("/public/loans", false)?.id).toBe("loans");
  });

  it("trả về null khi đã đăng nhập để router ERP nội bộ xử lý tại /loans-tool", () => {
    expect(resolvePublicTool("/public/loans-tool", true)).toBeNull();
    expect(resolvePublicTool("/loans-tool", true)).toBeNull();
    expect(resolvePublicTool("/tools/loans", true)).toBeNull();
    expect(resolvePublicTool("/loans", true)).toBeNull();
    expect(resolvePublicTool("/public/loans", true)).toBeNull();
  });

  it("trả về null với các đường dẫn không tồn tại", () => {
    expect(resolvePublicTool("/dashboard", false)).toBeNull();
    expect(resolvePublicTool("/tools/unknown", false)).toBeNull();
    expect(resolvePublicTool("/public/unknown-tool", false)).toBeNull();
  });

  it("chứa nhóm tools, path chuẩn /public/loans-tool và alias đầy đủ", () => {
    for (const tool of PUBLIC_TOOLS) {
      expect(tool.id).toBeTruthy();
      expect(tool.sectionId).toBe("tools");
      expect(tool.component).toBeDefined();
    }
    const loans = PUBLIC_TOOLS.find((t) => t.id === "loans");
    expect(loans?.path).toBe("/public/loans-tool");
    expect(loans?.aliasPaths).toEqual(
      expect.arrayContaining([
        "/loans-tool",
        "/tools/loans",
        "/loans",
        "/public/loans",
      ]),
    );
  });
});
