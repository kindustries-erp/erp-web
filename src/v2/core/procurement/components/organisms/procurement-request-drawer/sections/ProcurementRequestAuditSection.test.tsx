import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProcurementRequestAuditSection } from "./ProcurementRequestAuditSection";
import type {
  ProcurementApi,
  ProcurementApprovalEvent,
} from "../../../../procurement.types";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const ACTOR_ID = "11111111-2222-3333-4444-555555555555";

// Thời gian không có "Z" để kết quả hiển thị không phụ thuộc múi giờ máy chạy test.
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
    comment: "Duyệt đơn hàng gấp",
    createdAt: "2026-11-05T09:00:00",
  },
];

const renderSection = (approvalEvents: ReturnType<typeof vi.fn>) => {
  const api = { approvalEvents } as unknown as ProcurementApi<unknown>;
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <ProcurementRequestAuditSection
        documentId="doc-1"
        api={api}
        queryKey="test-query-key"
      />
    </QueryClientProvider>,
  );
};

const expandSection = () =>
  fireEvent.click(screen.getByRole("button", { name: "Mở rộng phân vùng" }));

describe("ProcurementRequestAuditSection", () => {
  it("mặc định thu gọn: chỉ hiện tiêu đề và số lượng, chưa hiện nội dung nhật ký", async () => {
    renderSection(vi.fn().mockResolvedValue(mockEvents));
    expect(screen.getByText("Nhật ký duyệt")).toBeInTheDocument();
    expect(await screen.findByText("(2)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mở rộng phân vùng" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByText("Trưởng garage").closest('[aria-hidden="true"]'),
    ).not.toBeNull();
  });

  it("mở ra thì thấy tác nhân, lý do và thời gian dễ đọc", async () => {
    renderSection(vi.fn().mockResolvedValue(mockEvents));
    await screen.findByText("(2)");
    expandSection();
    expect(screen.getByText("Trưởng garage")).toBeInTheDocument();
    expect(screen.getByText("NV Kế toán")).toBeInTheDocument();
    expect(screen.getByText("Lý do: Duyệt đơn hàng gấp")).toBeInTheDocument();
    expect(screen.getByText("05/11/2026 09:00")).toBeInTheDocument();
  });

  it("không hiện UUID của người thực hiện hoặc chuỗi ISO thời gian", async () => {
    const { container } = renderSection(vi.fn().mockResolvedValue(mockEvents));
    await screen.findByText("(2)");
    expandSection();
    expect(container.textContent).not.toContain(ACTOR_ID);
    expect(container.textContent).not.toContain("T09:00:00");
  });

  it("khi không có tên và email thì hiện 'Không xác định', không hiện UUID", async () => {
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

  it("hiển thị empty message khi không có sự kiện", async () => {
    renderSection(vi.fn().mockResolvedValue([]));
    expandSection();
    expect(
      await screen.findByText("Chưa có sự kiện phê duyệt nào"),
    ).toBeInTheDocument();
  });

  it("hiển thị trạng thái đang tải khi chưa có dữ liệu", () => {
    renderSection(vi.fn(() => new Promise(() => {})));
    expandSection();
    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
  });
});
