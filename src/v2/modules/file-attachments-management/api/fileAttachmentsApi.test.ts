import { beforeEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import {
  fileAttachmentsV2Api,
  toFileAttachmentsListParams,
} from "./fileAttachmentsApi";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));
const http = vi.mocked(v2HttpClient);

const query = {
  page: 1,
  pageSize: 20,
  search: " a ",
  sorts: [{ columnKey: "createdAt", direction: "desc" }],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
} as never;

describe("fileAttachmentsV2Api", () => {
  beforeEach(() => vi.clearAllMocks());

  it("params: sort ngược, deleted=only, bỏ các filter rỗng", () => {
    const p = toFileAttachmentsListParams(query, { deleted: "only" });
    expect(p.sort).toBe("-createdAt");
    expect(p.deleted).toBe("only");
    expect(p.search).toBe("a");
    expect(p.column_filters).toBeUndefined();
  });

  it("list lấy total từ pagination", async () => {
    http.get.mockResolvedValue({
      data: { items: [{ id: "1" }], pagination: { total: 7 } },
    });
    expect((await fileAttachmentsV2Api.list(query)).total).toBe(7);
  });

  it("purge gửi ids và trả purged/skipped", async () => {
    http.post.mockResolvedValue({
      data: {
        data: {
          purged: [],
          skipped: [{ id: "x", reason: "NOT_SOFT_DELETED" }],
        },
      },
    });
    const r = await fileAttachmentsV2Api.purge(["x"]);
    expect(http.post).toHaveBeenCalledWith(
      "/api/v2/file-attachments-management/purge",
      {
        ids: ["x"],
      },
    );
    expect(r.skipped[0].reason).toBe("NOT_SOFT_DELETED");
  });

  it("options gửi filters và deleted", async () => {
    http.get.mockResolvedValue({
      data: { items: [], pagination: { next: 2 } },
    });
    const r = await fileAttachmentsV2Api.options(
      { columnKey: "category", pageParam: 1 } as never,
      { deleted: "only" },
    );
    expect(r.next).toBe(2);
    expect(
      (http.get.mock.calls[0][1] as { params: { deleted: string } }).params
        .deleted,
    ).toBe("only");
  });
});
