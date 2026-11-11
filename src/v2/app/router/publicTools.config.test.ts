import { describe, it, expect } from "vitest";
import { resolvePublicTool, PUBLIC_TOOLS } from "./publicTools.config";

describe("publicTools.config - resolvePublicTool", () => {
  it("khớp /tools/loans khi chưa đăng nhập", () => {
    const tool = resolvePublicTool("/tools/loans", false);
    expect(tool).toBeDefined();
    expect(tool?.id).toBe("loans");
  });

  it("khớp /loans khi chưa đăng nhập (alias route)", () => {
    const tool = resolvePublicTool("/loans", false);
    expect(tool).toBeDefined();
    expect(tool?.id).toBe("loans");
  });

  it("trả về null khi đã đăng nhập để router ERP nội bộ xử lý tại /tools/loans", () => {
    expect(resolvePublicTool("/tools/loans", true)).toBeNull();
    expect(resolvePublicTool("/loans", true)).toBeNull();
  });

  it("không còn hỗ trợ /public/loans", () => {
    expect(resolvePublicTool("/public/loans", false)).toBeNull();
    expect(resolvePublicTool("/public/loans", true)).toBeNull();
  });

  it("trả về null với các đường dẫn không tồn tại", () => {
    expect(resolvePublicTool("/dashboard", false)).toBeNull();
    expect(resolvePublicTool("/tools/unknown", false)).toBeNull();
  });

  it("chứa nhóm tools và chuẩn URL /tools/*", () => {
    for (const tool of PUBLIC_TOOLS) {
      expect(tool.id).toBeTruthy();
      expect(tool.path.startsWith("/tools/")).toBe(true);
      expect(tool.sectionId).toBe("tools");
      expect(tool.component).toBeDefined();
    }
  });
});
