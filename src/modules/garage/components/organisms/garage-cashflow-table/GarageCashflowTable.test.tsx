import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCashflowTable } from "./GarageCashflowTable";
import { useGarageCashflowTable } from "./GarageCashflowTable.hook";
import { getGarageCashflowRowActions } from "./GarageCashflowTable.columns";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hook
vi.mock("./GarageCashflowTable.hook", () => ({
  useGarageCashflowTable: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const mockRow: GarageCashflowVoucher = {
  id: "test-v-1",
  voucherCode: "PT-GARA-001",
  voucherType: "RECEIPT",
  amount: 1000000,
  transDate: "2026-10-11",
  createdAt: "2026-10-11T10:00:00Z",
  updatedAt: "2026-10-11T10:00:00Z",
} as any;

describe("GarageCashflowTable", () => {
  it("renders correctly without crashing", () => {
    (useGarageCashflowTable as any).mockReturnValue({
      data: [],
      total: 0,
      totalPages: 0,
      isLoading: false,
      page: 1,
      setPage: vi.fn(),
      pageSize: 20,
      setPageSize: vi.fn(),
      sorts: [],
      setSort: vi.fn(),
      columnFilters: {},
      setColumnFilter: vi.fn(),
      columnSearch: {},
      setColumnSearch: vi.fn(),
      activeFilterCount: 0,
      clearAllFilters: vi.fn(),
      refetch: vi.fn(),
      getColumnOptions: vi.fn(),
      createMutation: { mutate: vi.fn(), isPending: false },
      updateMutation: { mutate: vi.fn(), isPending: false },
      deleteMutation: { mutate: vi.fn(), isPending: false },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowTable
          tabs={[{ value: "all", label: "Tất cả" }]}
          activeTab="all"
          onTabChange={vi.fn()}
          onCreate={vi.fn()}
          canDelete={false}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Thu chi xưởng")).toBeInTheDocument();
    expect(screen.getByText("Tạo phiếu mới")).toBeInTheDocument();
  });

  describe("getGarageCashflowRowActions", () => {
    it("omits delete action when canDelete is false", () => {
      const onDelete = vi.fn();
      const actionsFn = getGarageCashflowRowActions(
        vi.fn(),
        onDelete,
        true,
        false,
      );
      const actions = actionsFn(mockRow);

      const hasDelete = actions.some((group: any) =>
        group.items?.some((item: any) => item.key === "delete"),
      );
      expect(hasDelete).toBe(false);
    });

    it("omits delete action when onDelete is undefined even if canDelete is true", () => {
      const actionsFn = getGarageCashflowRowActions(
        vi.fn(),
        undefined,
        true,
        true,
      );
      const actions = actionsFn(mockRow);

      const hasDelete = actions.some((group: any) =>
        group.items?.some((item: any) => item.key === "delete"),
      );
      expect(hasDelete).toBe(false);
    });

    it("includes delete action with red icon and normal text without danger variant when canDelete is true and onDelete exists", () => {
      const onDelete = vi.fn();
      const actionsFn = getGarageCashflowRowActions(
        vi.fn(),
        onDelete,
        true,
        true,
      );
      const actions = actionsFn(mockRow);

      const deleteGroup = actions.find(
        (group: any) => group.groupLabel === "Khác",
      );
      expect(deleteGroup).toBeDefined();

      const deleteItem = deleteGroup?.items.find(
        (item: any) => item.key === "delete",
      ) as any;
      expect(deleteItem).toBeDefined();
      expect(deleteItem?.label).toBe("Xóa phiếu");
      expect(deleteItem?.variant).toBeUndefined();

      expect(React.isValidElement(deleteItem?.icon)).toBe(true);
      expect((deleteItem?.icon.props as any).className).toContain(
        "text-red-500",
      );

      deleteItem?.onClick();
      expect(onDelete).toHaveBeenCalledWith(mockRow);
    });
  });
});
