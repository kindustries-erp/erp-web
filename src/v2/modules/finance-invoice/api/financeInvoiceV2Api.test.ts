import { afterEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { financeInvoiceV2Api } from "./financeInvoiceV2Api";

describe("financeInvoiceV2Api", () => {
  afterEach(() => vi.restoreAllMocks());

  it("lists invoices from the erp-invoices route, not a core-prefixed one", async () => {
    const get = vi
      .spyOn(v2HttpClient, "get")
      .mockResolvedValue({ data: { items: [], total: 0 } });
    await financeInvoiceV2Api.list({
      direction: "IN",
      page: 1,
      pageSize: 20,
    });
    expect(get).toHaveBeenCalledWith(
      "/api/v1/erp-invoices",
      expect.objectContaining({ params: expect.any(Object) }),
    );
  });

  it("requests column options from erp-invoices/column-options with snake_case filters", async () => {
    const get = vi.spyOn(v2HttpClient, "get").mockResolvedValue({
      data: { items: [], total: 0, page: 1, totalPages: 1 },
    });
    await financeInvoiceV2Api.getColumnOptions({
      column: "partner",
      search: "abc",
      page: 2,
      pageSize: 20,
      columnFilters: "{}",
      direction: "OUT",
    });
    expect(get).toHaveBeenCalledWith("/api/v1/erp-invoices/column-options", {
      params: {
        column: "partner",
        search: "abc",
        page: 2,
        pageSize: 20,
        column_filters: "{}",
        direction: "OUT",
      },
    });
  });
});
