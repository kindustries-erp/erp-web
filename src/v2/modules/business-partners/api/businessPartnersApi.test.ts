import { describe, expect, it } from "vitest";
import { createInitialQuery } from "@/v2/shared/components";
import { TableSortState, TextFilterOperator } from "@/v2/shared/types/v2-table";
import { toBusinessPartnerListParams } from "./businessPartnersApi";

describe("toBusinessPartnerListParams", () => {
  it("serializes the complete V2 server query", () => {
    const query = createInitialQuery({
      page: 2,
      sorts: [{ columnKey: "name", direction: TableSortState.DESC }],
      columnFilters: { status: ["ACTIVE"] },
      columnSearch: { code: "KH" },
      columnOperators: {
        name: { operator: TextFilterOperator.CONTAINS, value: "An" },
      },
      dateRanges: { createdAt: { from: "2026-01-01" } },
      search: "partner",
    });

    expect(toBusinessPartnerListParams("CUSTOMER", query)).toMatchObject({
      partnerType: "CUSTOMER",
      page: 2,
      sort: "-name",
      search: "partner",
      column_filters: '{"status":["ACTIVE"]}',
      column_search: '{"code":"KH"}',
      date_ranges: '{"createdAt":{"from":"2026-01-01"}}',
    });
  });
});
