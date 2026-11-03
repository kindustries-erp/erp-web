import { describe, expect, it } from "vitest";
import {
  buildCaptchaView,
  formatCaptchaImage,
} from "./GdtPortalAuthForm.helper";

describe("formatCaptchaImage", () => {
  it("bọc SVG thành data URL svg+xml", () => {
    const img = formatCaptchaImage("<svg><path/></svg>");
    expect(img.startsWith("data:image/svg+xml;utf8,")).toBe(true);
  });

  it("thêm tiền tố PNG base64 cho dữ liệu thô", () => {
    expect(formatCaptchaImage("AAAA")).toBe("data:image/png;base64,AAAA");
  });

  it("giữ nguyên data URL đã có sẵn", () => {
    expect(formatCaptchaImage("data:image/png;base64,BBBB")).toBe(
      "data:image/png;base64,BBBB",
    );
  });
});

describe("buildCaptchaView", () => {
  it("trả về null khi không có khóa", () => {
    expect(buildCaptchaView({ content: "x" })).toBeNull();
    expect(buildCaptchaView(null)).toBeNull();
  });

  it("dùng chữ server gửi kèm thay vì tự giải", () => {
    const view = buildCaptchaView({
      key: "k1",
      content: "base64image",
      text: "ABC123",
    });
    expect(view).toEqual({
      key: "k1",
      img: "data:image/png;base64,base64image",
      autoText: "ABC123",
    });
  });

  it("không có chữ và không có nội dung thì autoText rỗng", () => {
    expect(buildCaptchaView({ key: "k2" })?.autoText).toBe("");
  });
});
