import { beforeEach, describe, expect, it, vi } from "vitest";
import { AI_INVOICE_PREVIEW_TIMEOUT_MS, createAiInvoiceApi } from "./aiHub.api";
import { postV2Multipart } from "@/v2/shared/api/v2Multipart";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";

vi.mock("@/v2/shared/api/v2Multipart", () => ({ postV2Multipart: vi.fn() }));
vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { post: vi.fn() },
}));

describe("createAiInvoiceApi", () => {
  const api = createAiInvoiceApi("/api/v2/ai-hub-garage/");

  beforeEach(() => {
    vi.mocked(postV2Multipart).mockReset();
    vi.mocked(v2HttpClient.post).mockReset();
  });

  it("previewInvoice tải file lên invoice-preview với timeout dài", async () => {
    vi.mocked(postV2Multipart).mockResolvedValue({ lines: [] });
    const file = new File(["x"], "hd.png", { type: "image/png" });
    const controller = new AbortController();

    await api.previewInvoice(file, controller.signal);

    expect(postV2Multipart).toHaveBeenCalledWith(
      "/api/v2/ai-hub-garage/invoice-preview",
      file,
      { signal: controller.signal, timeoutMs: AI_INVOICE_PREVIEW_TIMEOUT_MS },
    );
  });

  it("createRequest gửi JSON tới purchase-requests và trả data", async () => {
    vi.mocked(v2HttpClient.post).mockResolvedValue({
      data: { requestId: "r1", requestNo: "GDNM-1", createdItems: [] },
    });
    const payload = { requestDate: "2026-11-12", lines: [] };

    const result = await api.createRequest(payload);

    expect(v2HttpClient.post).toHaveBeenCalledWith(
      "/api/v2/ai-hub-garage/purchase-requests",
      payload,
    );
    expect(result.requestId).toBe("r1");
  });
});
