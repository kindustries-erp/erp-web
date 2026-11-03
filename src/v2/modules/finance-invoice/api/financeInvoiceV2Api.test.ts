import { afterEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { financeInvoiceV2Api } from "./financeInvoiceV2Api";

describe("financeInvoiceV2Api", () => {
  afterEach(() => vi.restoreAllMocks());

  it("lists invoices from the v2 route", async () => {
    const get = vi
      .spyOn(v2HttpClient, "get")
      .mockResolvedValue({ data: { items: [], total: 0 } });
    await financeInvoiceV2Api.list({
      direction: "IN",
      page: 1,
      pageSize: 20,
    });
    expect(get).toHaveBeenCalledWith(
      "/api/v2/invoices",
      expect.objectContaining({ params: expect.any(Object) }),
    );
  });

  it("requests column options from the v2 route with a filters param", async () => {
    const get = vi.spyOn(v2HttpClient, "get").mockResolvedValue({
      data: { items: [], total: 0, next: null },
    });
    await financeInvoiceV2Api.getColumnOptions({
      column: "partner",
      search: "abc",
      page: 2,
      pageSize: 20,
      filters: '{"direction":["OUT"]}',
    });
    expect(get).toHaveBeenCalledWith("/api/v2/invoices/column-options", {
      params: {
        column: "partner",
        search: "abc",
        page: 2,
        pageSize: 20,
        filters: '{"direction":["OUT"]}',
      },
    });
  });
});
