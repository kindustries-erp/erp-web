// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useCustomFieldsList } from "../useCustomFieldsList";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";

// Mock dependencies
vi.mock("@/core/api/moduleConfigApi", () => ({
  moduleConfigApi: {
    getGlobalAttributeDefs: vi.fn(),
    getCategories: vi.fn(),
    createAttributeDef: vi.fn(),
    updateAttributeDef: vi.fn(),
    deleteAttributeDef: vi.fn(),
  },
  resolveAttrName: (def: any) => def?.name || def?.code,
  resolveCategoryName: (cat: any) => cat?.name || cat?.code,
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({
    locale: "vi",
  }),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback || key,
}));

describe("useCustomFieldsList", () => {
  let queryClient: QueryClient;

  const mockGlobalDefs = [
    {
      id: "def-1",
      code: "contract_no",
      name: "Số hợp đồng",
      nameEn: "Contract Number",
      fieldType: "TEXT",
      isRequired: true,
      isSystem: false,
      isActive: true,
      usageCount: 15,
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();

    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockImplementation(
      (modKey) => {
        if (modKey === "INVOICE_IN")
          return Promise.resolve(mockGlobalDefs as any);
        return Promise.resolve([]);
      },
    );

    vi.mocked(moduleConfigApi.getCategories).mockResolvedValue([]);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("fetches and normalizes rows correctly", async () => {
    const { result } = renderHook(() => useCustomFieldsList(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.rows.length).toBeGreaterThan(0);
    expect(result.current.rows[0].code).toBe("contract_no");
    expect(result.current.rows[0].moduleKey).toBe("INVOICE_IN");
    expect(result.current.rows[0].domain).toBe("FINANCE");
  });

  it("filters by domain correctly", async () => {
    const { result } = renderHook(() => useCustomFieldsList("FINANCE"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.rows.length).toBe(1);
    expect(result.current.rows[0].domain).toBe("FINANCE");
  });
});
