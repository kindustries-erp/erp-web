import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGarageCashflowDuplicateGuard } from "./useGarageCashflowDuplicateGuard";
import { garageCashflowApi } from "../../../api/garageCashflowApi";

vi.mock("react-hot-toast", () => ({ toast: vi.fn() }));
vi.mock("../../../api/garageCashflowApi", () => ({
  garageCashflowApi: { checkDuplicates: vi.fn() },
}));

const empty = { items: [], total: 0 };
const hit = {
  items: [
    {
      id: "v1",
      voucherCode: "PT-1",
      voucherType: "RECEIPT",
      amount: 1000,
      transDate: "2026-10-10",
    },
  ],
  total: 1,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe("useGarageCashflowDuplicateGuard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("proceeds immediately when no duplicates", async () => {
    vi.mocked(garageCashflowApi.checkDuplicates).mockResolvedValue({
      nearbyDate: empty,
      sameCase: empty,
      samePlate: empty,
    } as any);
    const proceed = vi.fn();
    const { result } = renderHook(() => useGarageCashflowDuplicateGuard(), {
      wrapper,
    });
    act(() => result.current.guard({ amount: 1000 }, proceed));
    await waitFor(() => expect(proceed).toHaveBeenCalledTimes(1));
    expect(result.current.pending).toBeNull();
  });

  it("holds save until confirmed when duplicates exist", async () => {
    vi.mocked(garageCashflowApi.checkDuplicates).mockResolvedValue({
      nearbyDate: hit,
      sameCase: empty,
      samePlate: empty,
    } as any);
    const proceed = vi.fn();
    const { result } = renderHook(() => useGarageCashflowDuplicateGuard(), {
      wrapper,
    });
    act(() => result.current.guard({ amount: 1000 }, proceed));
    await waitFor(() => expect(result.current.pending).not.toBeNull());
    expect(proceed).not.toHaveBeenCalled();
    act(() => result.current.confirm());
    expect(proceed).toHaveBeenCalledTimes(1);
    expect(result.current.pending).toBeNull();
  });

  it("cancel discards pending without saving", async () => {
    vi.mocked(garageCashflowApi.checkDuplicates).mockResolvedValue({
      nearbyDate: empty,
      sameCase: hit,
      samePlate: empty,
    } as any);
    const proceed = vi.fn();
    const { result } = renderHook(() => useGarageCashflowDuplicateGuard(), {
      wrapper,
    });
    act(() => result.current.guard({ amount: 1000 }, proceed));
    await waitFor(() => expect(result.current.pending).not.toBeNull());
    act(() => result.current.cancel());
    expect(result.current.pending).toBeNull();
    expect(proceed).not.toHaveBeenCalled();
  });

  it("fails open when the check errors", async () => {
    vi.mocked(garageCashflowApi.checkDuplicates).mockRejectedValue(
      new Error("boom"),
    );
    const proceed = vi.fn();
    const { result } = renderHook(() => useGarageCashflowDuplicateGuard(), {
      wrapper,
    });
    act(() => result.current.guard({ amount: 1000 }, proceed));
    await waitFor(() => expect(proceed).toHaveBeenCalledTimes(1));
  });
});
