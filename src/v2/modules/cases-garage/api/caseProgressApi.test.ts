import { beforeEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { caseProgressApi } from "./caseProgressApi";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(v2HttpClient.get);
const patch = vi.mocked(v2HttpClient.patch);
const post = vi.mocked(v2HttpClient.post);
const BASE = "/api/v2/cases-garage";

describe("caseProgressApi", () => {
  beforeEach(() => {
    get.mockReset().mockResolvedValue({ data: { items: [] } } as never);
    patch.mockReset().mockResolvedValue({ data: { message: "ok" } } as never);
    post.mockReset().mockResolvedValue({ data: { message: "ok" } } as never);
  });

  it("list gọi /progress, bỏ tham số rỗng, giữ status ALL", async () => {
    await caseProgressApi.list({ status: "ALL", pageSize: 200, search: "" });
    expect(get).toHaveBeenCalledWith(`${BASE}/progress`, {
      params: { status: "ALL", pageSize: 200 },
    });
  });

  it("updateStatus gửi PATCH :id/status với body { status }", async () => {
    await caseProgressApi.updateStatus("c1", "INTAKE");
    expect(patch).toHaveBeenCalledWith(`${BASE}/c1/status`, {
      status: "INTAKE",
    });
  });

  it("updateProgress gửi PATCH :id/progress với payload", async () => {
    await caseProgressApi.updateProgress("c1", { progressStage: "PAINTING" });
    expect(patch).toHaveBeenCalledWith(`${BASE}/c1/progress`, {
      progressStage: "PAINTING",
    });
  });

  it("revert gửi POST :id/revert, có hoặc không có danh sách field", async () => {
    await caseProgressApi.revert("c1", ["status"]);
    expect(post).toHaveBeenLastCalledWith(`${BASE}/c1/revert`, {
      fields: ["status"],
    });
    await caseProgressApi.revert("c1");
    expect(post).toHaveBeenLastCalledWith(`${BASE}/c1/revert`, {});
  });

  it("trả về data của response", async () => {
    await expect(caseProgressApi.updateStatus("c1", "QUOTED")).resolves.toEqual(
      { message: "ok" },
    );
  });

  it("gửi header x-kgara-branch-id cho đọc và ghi khi có branchId", async () => {
    const cfg = { headers: { "x-kgara-branch-id": "ext-1" } };
    await caseProgressApi.list({ status: "ALL" }, "ext-1");
    expect(get).toHaveBeenCalledWith(`${BASE}/progress`, {
      params: { status: "ALL" },
      ...cfg,
    });
    await caseProgressApi.updateStatus("c1", "INTAKE", "ext-1");
    expect(patch).toHaveBeenCalledWith(
      `${BASE}/c1/status`,
      { status: "INTAKE" },
      cfg,
    );
    await caseProgressApi.revert("c1", ["status"], "ext-1");
    expect(post).toHaveBeenCalledWith(
      `${BASE}/c1/revert`,
      { fields: ["status"] },
      cfg,
    );
  });
});
