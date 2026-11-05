import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ProcurementRequestApprovalTab,
  mapProcurementActionVariant,
} from "./ProcurementRequestApprovalTab";
import type {
  ProcurementApi,
  ProcurementApprovalEvent,
} from "../../../../procurement.types";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const mockEvents: ProcurementApprovalEvent[] = [
  {
    id: "evt-1",
    docType: "GARAGE_PROCUREMENT_REQUEST",
    docId: "doc-1",
    action: "submit",
    actorName: "NV Kế toán",
    createdAt: "2026-11-05T08:00:00Z",
  },
  {
    id: "evt-2",
    docType: "GARAGE_PROCUREMENT_REQUEST",
    docId: "doc-1",
    action: "approve",
    actorName: "Trưởng garage",
    reason: "Duyệt đơn hàng gấp",
    createdAt: "2026-11-05T09:00:00Z",
  },
];

describe("ProcurementRequestApprovalTab", () => {
  it("mapProcurementActionVariant ánh xạ đúng màu semantic", () => {
    expect(mapProcurementActionVariant("approve")).toBe("success");
    expect(mapProcurementActionVariant("approved")).toBe("success");
    expect(mapProcurementActionVariant("reject")).toBe("danger");
    expect(mapProcurementActionVariant("cancel")).toBe("danger");
    expect(mapProcurementActionVariant("submit")).toBe("warning");
    expect(mapProcurementActionVariant("other")).toBe("default");
  });

  it("render đúng các sự kiện duyệt từ API", async () => {
    const api: Partial<ProcurementApi<unknown>> = {
      approvalEvents: vi.fn().mockResolvedValue(mockEvents),
    };

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <ProcurementRequestApprovalTab
          documentId="doc-1"
          api={api as ProcurementApi<unknown>}
          queryKey="test-query-key"
        />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Trưởng garage")).toBeInTheDocument();
    expect(screen.getByText("Duyệt đơn hàng gấp")).toBeInTheDocument();
    expect(screen.getByText("NV Kế toán")).toBeInTheDocument();
  });

  it("hiển thị empty message khi không có sự kiện", async () => {
    const api: Partial<ProcurementApi<unknown>> = {
      approvalEvents: vi.fn().mockResolvedValue([]),
    };

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <ProcurementRequestApprovalTab
          documentId="doc-1"
          api={api as ProcurementApi<unknown>}
          queryKey="test-query-key"
        />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Chưa có sự kiện phê duyệt nào"),
    ).toBeInTheDocument();
  });
});
