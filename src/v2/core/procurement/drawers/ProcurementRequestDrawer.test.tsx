import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProcurementRequestDrawer } from "./ProcurementRequestDrawer";
import type { ProcurementDrawerProps } from "./procurementDrawer.type";
import type { ProcurementRequestDetail } from "../procurement.types";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const mockDetail: ProcurementRequestDetail = {
  id: "req-100",
  requestNo: "PR-2026-100",
  requestDate: "2026-11-05",
  neededDate: "2026-11-12",
  title: "Đề nghị mua lốp xe",
  branchId: "branch-1",
  branchName: "Chi nhánh Hà Nội",
  status: "PENDING_APPROVAL",
  orderingStatus: "NONE",
  createdBy: "Trần Văn B",
  createdAt: "2026-11-05T09:00:00Z",
  remarks: "Cần gấp trong tuần",
  lines: [
    {
      id: "line-1",
      lineType: "GOODS",
      itemCode: "TIRE-01",
      itemName: "Lốp Michelin 205/55R16",
      qtyRequested: 4,
      estUnitPrice: 2000000,
    },
  ],
};

describe("ProcurementRequestDrawer", () => {
  it("render đúng tiêu đề và subtitle ở chế độ view", async () => {
    const props: ProcurementDrawerProps = {
      open: true,
      documentId: "req-100",
      mode: "view",
      canUpdate: true,
      onClose: vi.fn(),
      queryKey: "test-pr",
      api: {
        get: vi.fn().mockResolvedValue(mockDetail),
        create: vi.fn(),
        replaceLines: vi.fn(),
        list: vi.fn(),
        transition: vi.fn(),
      },
    };

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <ProcurementRequestDrawer {...props} />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("PR-2026-100")).toBeInTheDocument();
    expect(screen.getByText("Đề nghị mua")).toBeInTheDocument();
  });

  it("hiển thị các Top Navigation Tabs khi xem bản ghi", async () => {
    const props: ProcurementDrawerProps = {
      open: true,
      documentId: "req-100",
      mode: "view",
      canUpdate: true,
      onClose: vi.fn(),
      queryKey: "test-pr",
      api: {
        get: vi.fn().mockResolvedValue(mockDetail),
        create: vi.fn(),
        replaceLines: vi.fn(),
        list: vi.fn(),
        transition: vi.fn(),
      },
    };

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <ProcurementRequestDrawer {...props} />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Chi tiết")).toBeInTheDocument();
    expect(screen.getByText("Nhật ký duyệt")).toBeInTheDocument();
    expect(screen.getByText("Chứng từ liên kết")).toBeInTheDocument();
  });

  it("gọi onTransition khi click nút Duyệt ở trạng thái SUBMITTED", async () => {
    const onTransition = vi.fn();
    const props: ProcurementDrawerProps = {
      open: true,
      documentId: "req-100",
      mode: "view",
      canUpdate: true,
      onClose: vi.fn(),
      queryKey: "test-pr",
      onTransition,
      api: {
        get: vi.fn().mockResolvedValue(mockDetail),
        create: vi.fn(),
        replaceLines: vi.fn(),
        list: vi.fn(),
        transition: vi.fn(),
      },
    };

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <ProcurementRequestDrawer {...props} />
      </QueryClientProvider>,
    );

    const approveButton = await screen.findByRole("button", { name: "Duyệt" });
    fireEvent.click(approveButton);
    expect(onTransition).toHaveBeenCalledWith(
      "approve",
      expect.objectContaining({ id: "req-100" }),
    );
  });
});
