import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useGarageCaseEditForm } from "../useGarageCaseEditForm";
import { garageApi } from "../../api/garageApi";

vi.mock("../../api/garageApi", () => ({
  garageApi: {
    addCaseSettlement: vi.fn().mockResolvedValue({ id: "settlement-new-1" }),
    removeCaseSettlement: vi.fn().mockResolvedValue({ success: true }),
    addCaseLinkedInvoice: vi.fn().mockResolvedValue({ id: "link-1" }),
    addCaseLinkedInvoices: vi.fn().mockResolvedValue([{ id: "link-1" }]),
    removeCaseLinkedInvoice: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useGarageCaseEditForm - Manual Off-system Cashflow Staging & Saving", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with no pending changes", () => {
    const { result } = renderHook(() => useGarageCaseEditForm("case-123"), {
      wrapper: createWrapper(),
    });

    expect(result.current.hasPendingChanges).toBe(false);
    expect(result.current.editMode).toBe(false);
  });

  it("should add manual settlement into pending state and mark hasPendingChanges as true", () => {
    const { result } = renderHook(() => useGarageCaseEditForm("case-123"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.startEdit();
    });

    expect(result.current.editMode).toBe(true);

    act(() => {
      result.current.addSettlements([
        {
          settlementType: "RECEIPT",
          sourceChannel: "OFF_SYSTEM_MANUAL",
          category: "TIEN_MAT_NGOAI",
          amount: 2200000,
          transDate: "2026-10-05",
          partnerName: "Anh Nam",
          note: "Thu tien mat truc tiep tai xuong",
        },
      ]);
    });

    expect(result.current.hasPendingChanges).toBe(true);
    expect(result.current.pendingAddedSettlements).toHaveLength(1);
    expect(result.current.pendingAddedSettlements[0]).toMatchObject({
      settlementType: "RECEIPT",
      sourceChannel: "OFF_SYSTEM_MANUAL",
      category: "TIEN_MAT_NGOAI",
      amount: 2200000,
      partnerName: "Anh Nam",
      isPending: true,
    });

    const activeList = result.current.getActiveSettlements([]);
    expect(activeList).toHaveLength(1);
    expect(activeList[0].amount).toBe(2200000);
    expect(activeList[0].isPending).toBe(true);
  });

  it("should compute active financial summary accurately when manual cashflow is staged", () => {
    const { result } = renderHook(() => useGarageCaseEditForm("case-123"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.startEdit();
      result.current.addSettlements([
        {
          settlementType: "RECEIPT",
          sourceChannel: "OFF_SYSTEM_MANUAL",
          category: "TIEN_MAT_NGOAI",
          amount: 1500000,
          transDate: "2026-10-05",
        },
      ]);
    });

    const mockServerSummary = {
      targetRevenue: 2000000,
      targetCost: 1000000,
      breakdown: {
        receipts: {},
        payments: {},
      },
    };

    const activeSettlements = result.current.getActiveSettlements([]);
    const summary = result.current.getActiveFinancialSummary(
      mockServerSummary,
      activeSettlements,
    );

    expect(summary).not.toBeNull();
    expect(summary?.breakdown.receipts.directReceiptOffSystem).toBe(1500000);
    expect(summary?.breakdown.receipts.totalCollected).toBe(1500000);
    expect(summary?.breakdown.receipts.remainingReceivable).toBe(500000);
  });

  it("should remove staged manual settlement before saving", () => {
    const { result } = renderHook(() => useGarageCaseEditForm("case-123"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.startEdit();
      result.current.addSettlements([
        {
          settlementType: "RECEIPT",
          sourceChannel: "OFF_SYSTEM_MANUAL",
          category: "TIEN_MAT_NGOAI",
          amount: 500000,
        },
      ]);
    });

    const tempId = result.current.pendingAddedSettlements[0].tempId;
    expect(tempId).toBeDefined();

    act(() => {
      result.current.removeSettlement(tempId);
    });

    expect(result.current.hasPendingChanges).toBe(false);
    expect(result.current.pendingAddedSettlements).toHaveLength(0);
    expect(result.current.pendingDeletedSettlementIds).toHaveLength(0);
  });

  it("should persist all staged manual settlements when handleSave is called", async () => {
    const { result } = renderHook(() => useGarageCaseEditForm("case-123"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.startEdit();
      result.current.addSettlements([
        {
          settlementType: "RECEIPT",
          sourceChannel: "OFF_SYSTEM_MANUAL",
          category: "TIEN_MAT_NGOAI",
          amount: 1000000,
          transDate: "2026-10-05",
          partnerName: "Khách hàng A",
          note: "Tien mat ngoai",
        },
      ]);
    });

    await act(async () => {
      await result.current.handleSave("case-123");
    });

    expect(garageApi.addCaseSettlement).toHaveBeenCalledTimes(1);
    expect(garageApi.addCaseSettlement).toHaveBeenCalledWith("case-123", {
      settlementType: "RECEIPT",
      sourceChannel: "OFF_SYSTEM_MANUAL",
      category: "TIEN_MAT_NGOAI",
      amount: 1000000,
      transDate: "2026-10-05",
      partnerName: "Khách hàng A",
      note: "Tien mat ngoai",
      bankTransactionId: undefined,
    });

    expect(result.current.hasPendingChanges).toBe(false);
    expect(result.current.editMode).toBe(false);
  });
});
