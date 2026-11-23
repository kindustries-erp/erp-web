import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProcurementApprovalEvents } from "./useProcurementApprovalEvents";
import type {
  ProcurementApi,
  ProcurementApprovalEvent,
} from "../procurement.types";

const wrap = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

const events: ProcurementApprovalEvent[] = [
  {
    action: "submit",
    fromStatus: "DRAFT",
    toStatus: "PENDING_APPROVAL",
    actorId: "u-1",
    actorName: null,
    actorEmail: "nv@x.vn",
    actorRoles: [],
    comment: null,
    createdAt: "2026-11-05T08:00:00Z",
  },
];

describe("useProcurementApprovalEvents", () => {
  it("tải nhật ký theo documentId", async () => {
    const approvalEvents = vi.fn().mockResolvedValue(events);
    const api = { approvalEvents } as unknown as ProcurementApi<unknown>;
    const { result } = renderHook(
      () => useProcurementApprovalEvents("doc-1", api, "q-key"),
      { wrapper: wrap() },
    );
    await waitFor(() => expect(result.current.data).toEqual(events));
    expect(approvalEvents).toHaveBeenCalledWith("doc-1");
  });

  it("không gọi API khi chưa có documentId (tạo mới)", () => {
    const approvalEvents = vi.fn().mockResolvedValue(events);
    const api = { approvalEvents } as unknown as ProcurementApi<unknown>;
    const { result } = renderHook(
      () => useProcurementApprovalEvents(null, api, "q-key"),
      { wrapper: wrap() },
    );
    expect(result.current.fetchStatus).toBe("idle");
    expect(approvalEvents).not.toHaveBeenCalled();
  });

  it("trả mảng rỗng khi API không có approvalEvents", async () => {
    const api = {} as ProcurementApi<unknown>;
    const { result } = renderHook(
      () => useProcurementApprovalEvents("doc-1", api, "q-key"),
      { wrapper: wrap() },
    );
    await waitFor(() => expect(result.current.data).toEqual([]));
  });
});
