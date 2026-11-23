import { beforeEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { auditLogsV2Api, toAuditLogsListParams } from "./auditLogsV2Api";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get: vi.fn() },
}));

const get = vi.mocked(v2HttpClient.get);
const pagination = {
  page: 2,
  pageSize: 10,
  total: 31,
  totalPages: 4,
  next: 3,
  previous: 1,
};

describe("auditLogsV2Api", () => {
  beforeEach(() => get.mockReset());

  it("dịch tham số: chỉ date_from/date_to, sorts lặp, bỏ giá trị rỗng", () => {
    const p = toAuditLogsListParams({
      page: 2,
      module: "users",
      date_from: "2026-02-01",
      date_to: "2026-03-01",
      sorts: ["-createdAt", "module"],
      search: "",
    });
    expect(p.get("date_from")).toBe("2026-02-01");
    expect(p.get("date_to")).toBe("2026-03-01");
    expect(p.getAll("sorts")).toEqual(["-createdAt", "module"]);
    expect(p.has("search")).toBe(false);
    expect(p.has("dateFrom")).toBe(false);
  });

  it("list gọi /api/v2/audit-logs và trả hình dạng cũ {data,total,page,pageSize}", async () => {
    get.mockResolvedValueOnce({ data: { items: [{ id: "1" }], pagination } });
    const res = await auditLogsV2Api.list({ page: 2, pageSize: 10 });
    expect(get.mock.calls[0][0]).toMatch(/^\/api\/v2\/audit-logs\?/);
    expect(res).toEqual({
      data: [{ id: "1" }],
      total: 31,
      page: 2,
      pageSize: 10,
    });
  });

  it("columnOptions trả {items,total,next}", async () => {
    get.mockResolvedValueOnce({
      data: { items: [{ label: "a", value: "a" }], pagination },
    });
    const res = await auditLogsV2Api.columnOptions("module", "a", 2, 10, "{}");
    expect(get.mock.calls[0][0]).toContain(
      "/api/v2/audit-logs/column-options?",
    );
    expect(get.mock.calls[0][0]).toContain("filters=%7B%7D");
    expect(res).toEqual({
      items: [{ label: "a", value: "a" }],
      total: 31,
      next: 3,
    });
  });

  it("timeline trả mảng rỗng khi server thiếu items", async () => {
    get.mockResolvedValueOnce({ data: {} });
    expect(await auditLogsV2Api.timeline("core_user", "1")).toEqual([]);
  });

  it("timeline trả mảng thuần", async () => {
    get.mockResolvedValueOnce({ data: { items: [{ id: "1" }] } });
    expect(await auditLogsV2Api.timeline("core_user", "u/1")).toEqual([
      { id: "1" },
    ]);
    expect(get).toHaveBeenCalledWith(
      "/api/v2/audit-logs/core_user/u%2F1/timeline",
    );
  });
});
