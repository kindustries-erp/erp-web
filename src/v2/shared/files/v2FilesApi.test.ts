import { beforeEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { createV2OwnerFilesApi } from "./v2FilesApi";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const http = vi.mocked(v2HttpClient);
const api = createV2OwnerFilesApi("/api/v2/invoices/1/attachments");

describe("createV2OwnerFilesApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("list trả items cùng policy và categories từ extraData", async () => {
    http.get.mockResolvedValue({
      data: {
        items: [{ id: "a" }],
        extraData: { policy: { maxFileBytes: 1 }, categories: ["KHAC"] },
      },
    });
    const result = await api.list();
    expect(result.items).toHaveLength(1);
    expect(result.policy?.maxFileBytes).toBe(1);
    expect(result.categories).toEqual(["KHAC"]);
  });

  it("list không có extraData thì policy null", async () => {
    http.get.mockResolvedValue({ data: { items: [] } });
    expect((await api.list()).policy).toBeNull();
  });

  it("upload gửi field files và category", async () => {
    http.post.mockResolvedValue({ data: { data: [] } });
    await api.upload([new File(["x"], "a.pdf")], "HOA_DON");
    const form = http.post.mock.calls[0][1] as FormData;
    expect(form.getAll("files")).toHaveLength(1);
    expect(form.get("category")).toBe("HOA_DON");
  });

  it("downloadUrl gửi inline khi cần", async () => {
    http.get.mockResolvedValue({
      data: { data: { url: "u", expiresIn: 300 } },
    });
    expect((await api.downloadUrl("x", true)).url).toBe("u");
    expect(http.get.mock.calls[0][1]).toEqual({ params: { inline: true } });
  });

  it("remove gọi DELETE đúng đường dẫn", async () => {
    http.delete.mockResolvedValue({});
    await api.remove("x");
    expect(http.delete).toHaveBeenCalledWith(
      "/api/v2/invoices/1/attachments/x",
    );
  });
});
