import { beforeEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { caseWorkshopApi } from "./caseWorkshopApi";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const http = vi.mocked(v2HttpClient);
const BASE = "/api/v2/cases-garage";
const H = { headers: { "x-erp-branch-id": "KG1" } };

describe("caseWorkshopApi", () => {
  beforeEach(() => {
    http.get
      .mockReset()
      .mockResolvedValue({ data: { items: [{ id: "x" }] } } as never);
    http.post
      .mockReset()
      .mockResolvedValue({ data: { data: { id: "l1" } } } as never);
    http.patch
      .mockReset()
      .mockResolvedValue({ data: { data: { id: "l1" } } } as never);
    http.delete.mockReset().mockResolvedValue({ data: {} } as never);
  });

  it("board gọi workshop/board, bỏ tham số rỗng, gửi header chi nhánh", async () => {
    await caseWorkshopApi.board(
      { search: "", pageSize: 200, finishedDays: 7 },
      "KG1",
    );
    expect(http.get).toHaveBeenCalledWith(`${BASE}/workshop/board`, {
      params: { pageSize: 200, finishedDays: 7 },
      ...H,
    });
  });

  it("timeline và workers trả mảng items", async () => {
    expect(await caseWorkshopApi.timeline("c1", "KG1")).toEqual([{ id: "x" }]);
    expect(http.get).toHaveBeenLastCalledWith(`${BASE}/c1/progress-logs`, H);
    expect(await caseWorkshopApi.workers("  an ", "KG1")).toEqual([
      { id: "x" },
    ]);
    expect(http.get).toHaveBeenLastCalledWith(`${BASE}/workshop/workers`, {
      params: { search: "an" },
      ...H,
    });
  });

  it("createLog/updateLog/removeLog gọi đúng route và trả data", async () => {
    const created = await caseWorkshopApi.createLog(
      "c1",
      { kind: "STAGE", stage: "PAINTING" },
      "KG1",
    );
    expect(created).toEqual({ id: "l1" });
    expect(http.post).toHaveBeenCalledWith(
      `${BASE}/c1/progress-logs`,
      { kind: "STAGE", stage: "PAINTING" },
      H,
    );
    await caseWorkshopApi.updateLog("l1", { note: null }, "KG1");
    expect(http.patch).toHaveBeenCalledWith(
      `${BASE}/progress-logs/l1`,
      { note: null },
      H,
    );
    await caseWorkshopApi.removeLog("l1", "KG1");
    expect(http.delete).toHaveBeenCalledWith(`${BASE}/progress-logs/l1`, H);
  });

  it("candidates, track, trackNew, untrack gọi đúng route", async () => {
    expect(await caseWorkshopApi.candidates(" 51g ", "KG1")).toEqual([
      { id: "x" },
    ]);
    expect(http.get).toHaveBeenLastCalledWith(`${BASE}/workshop/candidates`, {
      params: { search: "51g" },
      ...H,
    });
    await caseWorkshopApi.track({ caseId: "c1", status: undefined }, "KG1");
    expect(http.post).toHaveBeenLastCalledWith(
      `${BASE}/workshop/track`,
      { caseId: "c1" },
      H,
    );
    const res = await caseWorkshopApi.trackNew(
      { licensePlate: "30A-1", customerName: "" },
      "KG1",
    );
    expect(res).toEqual({ id: "l1" });
    expect(http.post).toHaveBeenLastCalledWith(
      `${BASE}/workshop/track-new`,
      { licensePlate: "30A-1" },
      H,
    );
    await caseWorkshopApi.untrack("c1", "KG1");
    expect(http.delete).toHaveBeenLastCalledWith(
      `${BASE}/workshop/track/c1`,
      H,
    );
  });

  it("không chọn chi nhánh: board không gửi header, backend trả mọi chi nhánh", async () => {
    await caseWorkshopApi.board({ classification: "OJ" });
    expect(http.get).toHaveBeenCalledWith(`${BASE}/workshop/board`, {
      params: { classification: "OJ" },
    });
  });
});
