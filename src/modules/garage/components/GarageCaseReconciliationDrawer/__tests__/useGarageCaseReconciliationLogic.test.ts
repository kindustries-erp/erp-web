import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGarageCaseReconciliationLogic } from "../useGarageCaseReconciliationLogic";
import { garageApi } from "@/modules/garage/api/garageApi";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, defaultVal: string) => defaultVal || k,
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/modules/garage/api/garageApi", () => ({
  garageApi: {
    getCaseFinancialSummary: vi.fn().mockResolvedValue(null),
    getCaseLinkedInvoices: vi.fn().mockResolvedValue([]),
    getSmartSettlementSuggestions: vi.fn().mockResolvedValue([]),
    addCaseSettlement: vi.fn().mockResolvedValue({ id: "settlement-new-1" }),
    removeCaseSettlement: vi.fn().mockResolvedValue({ success: true }),
  },
}));

describe("useGarageCaseReconciliationLogic - Draft-First Manual Cashflow", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it("should add manual cashflow to pending list without calling backend API", () => {
    const { result } = renderHook(
      () =>
        useGarageCaseReconciliationLogic({
          open: true,
          onClose: vi.fn(),
          caseId: "case-123",
          initialTab: "manual_cashflow",
        }),
      { wrapper },
    );

    act(() => {
      result.current.setManualAmount(1500000);
      result.current.setManualCategory("TIEN_MAT_NGOAI");
      result.current.setManualPartner("Anh Nam");
    });

    // Execute Add to Draft
    act(() => {
      result.current.handleAddManualToDraft();
    });

    // Backend API must NOT be called at this step
    expect(garageApi.addCaseSettlement).not.toHaveBeenCalled();

    // Form inputs must be reset
    expect(result.current.manualAmount).toBe("");
    expect(result.current.manualPartner).toBe("");

    // Pending list must have the newly added draft item
    expect(result.current.pendingManualSettlements).toHaveLength(1);
    expect(result.current.pendingManualSettlements[0].amount).toBe(1500000);
    expect(result.current.pendingManualSettlements[0].isPending).toBe(true);

    // activeSettlements must include the pending item
    expect(result.current.activeSettlements).toHaveLength(1);
    expect(result.current.currentManualAmount).toBe(1500000);
    expect(result.current.manualDraftPending).toBe(true);
  });

  it("should remove pending draft item without calling backend delete API", () => {
    const { result } = renderHook(
      () =>
        useGarageCaseReconciliationLogic({
          open: true,
          onClose: vi.fn(),
          caseId: "case-123",
          initialTab: "manual_cashflow",
        }),
      { wrapper },
    );

    act(() => {
      result.current.setManualAmount(500000);
    });
    act(() => {
      result.current.handleAddManualToDraft();
    });

    expect(result.current.pendingManualSettlements).toHaveLength(1);
    const draftTempId = result.current.pendingManualSettlements[0].id;

    // Remove the draft item
    act(() => {
      result.current.onRemoveSettlement?.(draftTempId);
    });

    // Backend remove API must NOT be called
    expect(garageApi.removeCaseSettlement).not.toHaveBeenCalled();
    expect(result.current.pendingManualSettlements).toHaveLength(0);
    expect(result.current.currentManualAmount).toBe(0);
  });

  it("should submit all pending draft items to API when handleSubmitBankAndCash is called", async () => {
    const onClose = vi.fn();
    const { result } = renderHook(
      () =>
        useGarageCaseReconciliationLogic({
          open: true,
          onClose,
          caseId: "case-123",
          initialTab: "manual_cashflow",
        }),
      { wrapper },
    );

    // Add first item to draft
    act(() => {
      result.current.setManualAmount(1000000);
      result.current.setManualCategory("TIEN_MAT_NGOAI");
    });
    act(() => {
      result.current.handleAddManualToDraft();
    });

    // Add second item to draft
    act(() => {
      result.current.setManualAmount(2000000);
      result.current.setManualCategory("CHUYEN_KHOAN_CA_NHAN");
    });
    act(() => {
      result.current.handleAddManualToDraft();
    });

    expect(result.current.pendingManualSettlements).toHaveLength(2);
    expect(garageApi.addCaseSettlement).not.toHaveBeenCalled();

    // Now call submit button
    await act(async () => {
      await result.current.handleSubmitBankAndCash();
    });

    // Now backend API must be called for each draft item
    expect(garageApi.addCaseSettlement).toHaveBeenCalledTimes(2);
    expect(garageApi.addCaseSettlement).toHaveBeenCalledWith(
      "case-123",
      expect.objectContaining({
        amount: 1000000,
        category: "TIEN_MAT_NGOAI",
      }),
    );
    expect(garageApi.addCaseSettlement).toHaveBeenCalledWith(
      "case-123",
      expect.objectContaining({
        amount: 2000000,
        category: "CHUYEN_KHOAN_CA_NHAN",
      }),
    );

    expect(result.current.pendingManualSettlements).toHaveLength(0);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should mark persisted settlement as pending deleted without calling API, and delete when submit", async () => {
    const onClose = vi.fn();
    const persistedSettlements = [
      {
        id: "persisted-settlement-1",
        settlement_type: "RECEIPT",
        source_channel: "OFF_SYSTEM_MANUAL",
        category: "TIEN_MAT_NGOAI",
        amount: 800000,
        trans_date: "2026-10-06",
      },
    ];

    const { result } = renderHook(
      () =>
        useGarageCaseReconciliationLogic({
          open: true,
          onClose,
          caseId: "case-123",
          initialTab: "manual_cashflow",
          activeSettlements: persistedSettlements,
        }),
      { wrapper },
    );

    expect(result.current.activeSettlements).toHaveLength(1);

    // Click delete on persisted settlement
    act(() => {
      result.current.onRemoveSettlement?.("persisted-settlement-1");
    });

    // Must NOT call delete API immediately
    expect(garageApi.removeCaseSettlement).not.toHaveBeenCalled();

    // Must exclude from activeSettlements display
    expect(result.current.activeSettlements).toHaveLength(0);
    expect(result.current.pendingDeletedSettlementIds).toContain(
      "persisted-settlement-1",
    );
    expect(result.current.hasManualChanges).toBe(true);

    // Call submit button
    await act(async () => {
      await result.current.handleSubmitBankAndCash();
    });

    // Now delete API must be called
    expect(garageApi.removeCaseSettlement).toHaveBeenCalledTimes(1);
    expect(garageApi.removeCaseSettlement).toHaveBeenCalledWith(
      "case-123",
      "persisted-settlement-1",
    );
    expect(result.current.pendingDeletedSettlementIds).toHaveLength(0);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
