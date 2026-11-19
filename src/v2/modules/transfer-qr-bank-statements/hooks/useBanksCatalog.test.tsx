import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBanksCatalog } from "./useBanksCatalog";
import { banksCatalogApi } from "../api/banksCatalogApi";

describe("useBanksCatalog", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it("returns static fallback initially or when error occurs", async () => {
    vi.spyOn(banksCatalogApi, "getBanks").mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useBanksCatalog(), {
      wrapper: createWrapper(),
    });

    expect(result.current.banks.length).toBeGreaterThanOrEqual(37);
    const vcb = result.current.findBank("VCB");
    expect(vcb).toBeDefined();
    expect(vcb?.bin).toBe("970436");
    expect(vcb?.logoUrl).toContain("VCB");
  });

  it("updates banks when API returns paginated banks", async () => {
    const mockResponse = {
      items: [
        {
          id: "bank-1",
          code: "VCB",
          shortName: "Vietcombank Custom",
          name: "Ngoại thương",
          bin: "970436",
          logoUrl: "https://custom-domain.com/vcb.png",
          aliases: ["VCB"],
          isActive: true,
          transferSupported: true,
          lookupSupported: true,
        },
      ],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
        next: null,
        previous: null,
      },
    };
    vi.spyOn(banksCatalogApi, "getBanks").mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useBanksCatalog(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.banks.length).toBe(1);
    });

    const vcb = result.current.findBank("970436");
    expect(vcb?.shortName).toBe("Vietcombank Custom");
    expect(vcb?.logoUrl).toBe("https://custom-domain.com/vcb.png");
  });

  it("handles scroll bottom pagination", async () => {
    const getBanksSpy = vi
      .spyOn(banksCatalogApi, "getBanks")
      .mockResolvedValueOnce({
        items: [
          {
            id: "bank-1",
            code: "VCB",
            shortName: "VCB",
            name: "Ngoại thương",
            bin: "970436",
            aliases: [],
            isActive: true,
            transferSupported: true,
            lookupSupported: true,
          },
        ],
        pagination: {
          page: 1,
          pageSize: 1,
          total: 2,
          totalPages: 2,
          next: 2,
          previous: null,
        },
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: "bank-2",
            code: "TCB",
            shortName: "TCB",
            name: "Kỹ thương",
            bin: "970407",
            aliases: [],
            isActive: true,
            transferSupported: true,
            lookupSupported: true,
          },
        ],
        pagination: {
          page: 2,
          pageSize: 1,
          total: 2,
          totalPages: 2,
          next: null,
          previous: 1,
        },
      });

    const { result } = renderHook(() => useBanksCatalog(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.banks.length).toBe(1);
      expect(result.current.hasNextPage).toBe(true);
    });

    act(() => {
      result.current.onScrollBottom();
    });

    await waitFor(() => {
      expect(result.current.banks.length).toBe(2);
    });

    expect(getBanksSpy).toHaveBeenCalledTimes(2);
  });
});
