import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/core/api/axiosInstance";
import { invoiceFilesV2Api } from "./invoiceFilesV2Api";

vi.mock("@/core/api/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
const http = vi.mocked(axiosInstance);

describe("invoiceFilesV2Api", () => {
  beforeEach(() => vi.clearAllMocks());

  it("list đọc policy và categories từ extraData", async () => {
    http.get.mockResolvedValue({
      data: {
        items: [{ id: "a" }],
        extraData: { policy: { maxFileBytes: 5 }, categories: ["KHAC"] },
      },
    });
    const r = await invoiceFilesV2Api.list("inv");
    expect(http.get).toHaveBeenCalledWith("/api/v2/invoices/inv/attachments");
    expect(r.policy?.maxFileBytes).toBe(5);
    expect(r.categories).toEqual(["KHAC"]);
  });

  it("list thiếu extraData thì policy null, items rỗng", async () => {
    http.get.mockResolvedValue({ data: {} });
    expect(await invoiceFilesV2Api.list("inv")).toEqual({
      items: [],
      policy: null,
      categories: [],
    });
  });

  it("upload gửi nhiều file và category", async () => {
    http.post.mockResolvedValue({ data: { data: [{ id: "n" }] } });
    const out = await invoiceFilesV2Api.upload(
      "inv",
      [new File(["x"], "a.pdf"), new File(["y"], "b.pdf")],
      "HOP_DONG",
    );
    const form = http.post.mock.calls[0][1] as FormData;
    expect(form.getAll("files")).toHaveLength(2);
    expect(form.get("category")).toBe("HOP_DONG");
    expect(out).toHaveLength(1);
  });

  it("downloadUrl gửi inline khi cần, remove gọi DELETE đúng đường dẫn", async () => {
    http.get.mockResolvedValue({
      data: { data: { url: "u", expiresIn: 300 } },
    });
    expect((await invoiceFilesV2Api.downloadUrl("inv", "a", true)).url).toBe(
      "u",
    );
    expect(http.get.mock.calls[0][1]).toEqual({ params: { inline: true } });
    http.delete.mockResolvedValue({});
    await invoiceFilesV2Api.remove("inv", "a");
    expect(http.delete).toHaveBeenCalledWith(
      "/api/v2/invoices/inv/attachments/a",
    );
  });
});
