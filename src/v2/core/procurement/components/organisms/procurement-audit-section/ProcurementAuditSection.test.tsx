import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProcurementAuditSection } from "./ProcurementAuditSection";
import type {
  ProcurementApi,
  ProcurementApprovalEvent,
} from "../../../procurement.types";

const ACTOR_ID = "99999999-aaaa-bbbb-cccc-dddddddddddd";

const mockEvents: ProcurementApprovalEvent[] = [
  {
    action: "submit",
    fromStatus: "DRAFT",
    toStatus: "PENDING_APPROVAL",
    actorId: ACTOR_ID,
    actorName: "NV Kế toán",
    actorEmail: null,
    actorRoles: [],
    comment: null,
    createdAt: "2026-11-05T08:00:00",
  },
  {
    action: "approve",
    fromStatus: "PENDING_APPROVAL",
    toStatus: "APPROVED",
    actorId: ACTOR_ID,
    actorName: "Trưởng garage",
    actorEmail: null,
    actorRoles: [],
    comment: "Đã kiểm tra phụ tùng đầy đủ",
    createdAt: "2026-11-05T09:30:00",
  },
];

const renderSection = (approvalEvents: ReturnType<typeof vi.fn>) => {
  const api = { approvalEvents } as unknown as ProcurementApi<unknown>;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <ProcurementAuditSection
        documentId="doc-test-1"
        api={api}
        queryKey="test-audit-key"
      />
    </QueryClientProvider>,
  );
};

const expandSection = () =>
  fireEvent.click(screen.getByRole("button", { name: "Mở rộng phân vùng" }));

describe("ProcurementAuditSection", () => {
  it("mặc định thu gọn và hiển thị số lượng sự kiện chính xác", async () => {
    renderSection(vi.fn().mockResolvedValue(mockEvents));
    expect(screen.getByText("Nhật ký duyệt")).toBeInTheDocument();
    expect(await screen.findByText("(2)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mở rộng phân vùng" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("mở ra thì thấy các sự kiện được hiển thị đồng nhất dưới dạng V2ActivityCard", async () => {
    renderSection(vi.fn().mockResolvedValue(mockEvents));
    await screen.findByText("(2)");
    expandSection();

    const cards = screen.getAllByTestId("v2-activity-card");
    expect(cards).toHaveLength(2);

    // Card 1: sự kiện approve mới nhất (Trưởng garage)
    expect(cards[0]).toHaveTextContent("Trưởng garage");
    expect(cards[0]).toHaveTextContent("approve");
    expect(cards[0]).toHaveTextContent("Lý do: Đã kiểm tra phụ tùng đầy đủ");

    // Card 2: sự kiện submit trước đó (NV Kế toán)
    expect(cards[1]).toHaveTextContent("NV Kế toán");
    expect(cards[1]).toHaveTextContent("submit");
  });

  it("bảo mật: không lộ UUID của người thực hiện và không lộ raw ISO date", async () => {
    const { container } = renderSection(vi.fn().mockResolvedValue(mockEvents));
    await screen.findByText("(2)");
    expandSection();

    expect(container.textContent).not.toContain(ACTOR_ID);
    expect(container.textContent).not.toContain("T09:30:00");
  });

  it("khi không có tên và email thì hiển thị 'Không xác định'", async () => {
    renderSection(
      vi
        .fn()
        .mockResolvedValue([
          { ...mockEvents[0], actorName: null, actorEmail: null },
        ]),
    );
    await screen.findByText("(1)");
    expandSection();

    expect(screen.getByText("Không xác định")).toBeInTheDocument();
    expect(screen.queryByText(ACTOR_ID)).not.toBeInTheDocument();
  });

  it("hiển thị thông báo khi không có sự kiện nào", async () => {
    renderSection(vi.fn().mockResolvedValue([]));
    expandSection();

    expect(
      await screen.findByText("Chưa có sự kiện phê duyệt nào"),
    ).toBeInTheDocument();
  });
});
