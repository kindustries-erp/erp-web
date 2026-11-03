import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, post, patch, del } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
}));

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get, post, patch, delete: del },
  V2_API_BASE_URL: "http://test",
}));

import { cashTransactionApi } from "./cashTransactionApi";

const BASE = "/api/v1/bank-transactions-core/transactions";

describe("cashTransactionApi", () => {
  beforeEach(() => {
    [get, post, patch, del].forEach((fn) => fn.mockReset());
  });

  it("đọc chi tiết giao dịch theo id", async () => {
    get.mockResolvedValue({ data: { id: "t1" } });
    const result = await cashTransactionApi.getTransaction("t1");
    expect(get).toHaveBeenCalledWith(`${BASE}/t1`);
    expect(result.id).toBe("t1");
  });

  it("PATCH chỉ gửi payload đã đổi", async () => {
    patch.mockResolvedValue({ data: { id: "t1" } });
    await cashTransactionApi.updateTransaction("t1", { note: "mới" });
    expect(patch).toHaveBeenCalledWith(`${BASE}/t1`, { note: "mới" });
  });

  it("đăng bút toán và hủy hạch toán", async () => {
    post.mockResolvedValue({ data: { id: "t1" } });
    const payload = {
      postingDate: "2026-10-27",
      lines: [{ accountId: "1111", debit: 100, credit: 0 }],
    };
    await cashTransactionApi.postTransaction("t1", payload);
    expect(post).toHaveBeenLastCalledWith(`${BASE}/t1/post`, payload);
    await cashTransactionApi.unpostTransaction("t1");
    expect(post).toHaveBeenLastCalledWith(`${BASE}/t1/unpost`);
  });

  it("liên kết và gỡ hóa đơn cấn trừ", async () => {
    post.mockResolvedValue({ data: { message: "ok" } });
    del.mockResolvedValue({ data: { message: "ok" } });
    await cashTransactionApi.linkInvoice("t1", {
      invoiceId: "i1",
      netOffAmount: 50,
    });
    expect(post).toHaveBeenCalledWith(`${BASE}/t1/net-off-invoices`, {
      invoiceId: "i1",
      netOffAmount: 50,
    });
    await cashTransactionApi.removeInvoice("t1", "n1");
    expect(del).toHaveBeenCalledWith(`${BASE}/t1/net-off-invoices/n1`);
  });

  it("lấy danh sách giao dịch theo đối tác với query", async () => {
    get.mockResolvedValue({ data: { data: [], total: 3 } });
    const result = await cashTransactionApi.listTransactions({
      page: 1,
      pageSize: 1,
      correspondentName: "ACME",
    });
    expect(get).toHaveBeenCalledWith(BASE, {
      params: { page: 1, pageSize: 1, correspondentName: "ACME" },
    });
    expect(result.total).toBe(3);
  });
});
