import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { businessPartnersV2Api } from "../businessPartnersApi";
import { useBusinessPartnersQuery } from "./useBusinessPartnersQuery";

const query: V2TableQuery = {
  page: 1,
  pageSize: 20,
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
};

const renderWith = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useBusinessPartnersQuery("CUSTOMER", query), {
    wrapper,
  });
};

describe("useBusinessPartnersQuery summaries", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sets summaries.code to the total row count so the summary row shows the total", async () => {
    vi.spyOn(businessPartnersV2Api, "list").mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 42,
        totalPages: 3,
        next: 2,
        previous: null,
      },
    });

    const { result } = renderWith();

    await waitFor(() => expect(result.current.total).toBe(42));
    expect(result.current.summaries).toEqual({
      code: { total: 42, pageSubtotal: 0, cumulative: 20 },
    });
  });

  it("merges API summaries for numeric columns, if the API returns any", async () => {
    vi.spyOn(businessPartnersV2Api, "list").mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 5,
        totalPages: 1,
        next: null,
        previous: null,
      },
      summaries: { amount: { total: 1500, pageSubtotal: 0, cumulative: 0 } },
    });

    const { result } = renderWith();

    await waitFor(() =>
      expect(result.current.summaries).toEqual({
        code: { total: 5, pageSubtotal: 0, cumulative: 5 },
        amount: { total: 1500, pageSubtotal: 0, cumulative: 0 },
      }),
    );
  });
});
