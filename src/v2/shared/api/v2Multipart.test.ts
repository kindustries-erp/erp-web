import { beforeEach, describe, expect, it, vi } from "vitest";
import { postV2Multipart } from "./v2Multipart";
import { v2HttpClient } from "./v2HttpClient";

vi.mock("./v2HttpClient", () => ({
  v2HttpClient: { post: vi.fn() },
}));

const post = v2HttpClient.post as unknown as ReturnType<typeof vi.fn>;

describe("postV2Multipart", () => {
  const file = new File(["x"], "hd.pdf", { type: "application/pdf" });

  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({ data: { ok: true } });
  });

  it("gửi FormData với header multipart và trả data", async () => {
    const result = await postV2Multipart<{ ok: boolean }>("/api/x", file);

    expect(result).toEqual({ ok: true });
    const [url, form, config] = post.mock.calls[0];
    expect(url).toBe("/api/x");
    expect(form).toBeInstanceOf(FormData);
    expect((form.get("file") as File).name).toBe("hd.pdf");
    expect(config.headers["Content-Type"]).toBe("multipart/form-data");
    expect(config).not.toHaveProperty("timeout");
  });

  it("thêm field chữ, bỏ giá trị rỗng, truyền signal và timeout", async () => {
    const controller = new AbortController();
    await postV2Multipart("/api/x", file, {
      fieldName: "doc",
      fields: { a: 1, b: null, c: undefined, d: false },
      signal: controller.signal,
      timeoutMs: 120000,
    });

    const [, form, config] = post.mock.calls[0];
    expect(form.get("doc")).toBeInstanceOf(File);
    expect(form.get("a")).toBe("1");
    expect(form.get("d")).toBe("false");
    expect(form.has("b")).toBe(false);
    expect(form.has("c")).toBe(false);
    expect(config.signal).toBe(controller.signal);
    expect(config.timeout).toBe(120000);
  });
});
