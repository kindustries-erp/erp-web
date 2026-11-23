import { describe, it, expect } from "vitest";
import {
  resolvePublicDeckKey,
  PUBLIC_DECK_ROUTES,
  SUPPORTED_DECK_KEYS,
} from "./publicDecks.config";

describe("publicDecks.config - resolvePublicDeckKey", () => {
  it("khớp /imotorbike (URL cũ trực tiếp)", () => {
    expect(resolvePublicDeckKey("/imotorbike")).toBe("imotorbike");
  });

  it("khớp /imotorbike/ (trailing slash)", () => {
    expect(resolvePublicDeckKey("/imotorbike/")).toBe("imotorbike");
  });

  it("khớp /public/imotorbike (URL chuẩn public)", () => {
    expect(resolvePublicDeckKey("/public/imotorbike")).toBe("imotorbike");
  });

  it("khớp /public/imotorbike/ (URL chuẩn kèm trailing slash)", () => {
    expect(resolvePublicDeckKey("/public/imotorbike/")).toBe("imotorbike");
  });

  it("trả về null với deck không tồn tại trong danh mục", () => {
    expect(resolvePublicDeckKey("/public/unknown-deck")).toBeNull();
    expect(resolvePublicDeckKey("/unknown-deck")).toBeNull();
  });

  it("trả về null với các route ERP thông thường", () => {
    expect(resolvePublicDeckKey("/dashboard")).toBeNull();
    expect(resolvePublicDeckKey("/loans-tool")).toBeNull();
    expect(resolvePublicDeckKey("/")).toBeNull();
  });

  it("chứa danh sách SUPPORTED_DECK_KEYS và PUBLIC_DECK_ROUTES đồng bộ", () => {
    expect(SUPPORTED_DECK_KEYS).toContain("imotorbike");
    expect(PUBLIC_DECK_ROUTES["/imotorbike"]).toBe("imotorbike");
    expect(PUBLIC_DECK_ROUTES["/public/imotorbike"]).toBe("imotorbike");
  });
});
