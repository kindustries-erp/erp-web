import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { ProcurementReceiptsSection } from "./ProcurementReceiptsSection";
import type { ProcurementReceiptHistory } from "../../../procurement.drawer.type";

function renderSection(history: ProcurementReceiptHistory) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ProcurementReceiptsSection orderId="po-1" history={history} />
    </QueryClientProvider>,
  );
}

describe("ProcurementReceiptsSection", () => {
  it("liệt kê các phiếu nhập (nhập nhiều đợt) và mở phiếu khi bấm số phiếu", async () => {
    const onOpen = vi.fn();
    renderSection({
      load: vi.fn().mockResolvedValue([
        {
          id: "r2",
          receiptNo: "GGR-002",
          receiptDate: "2026-11-12",
          status: "POSTED",
          totalAmount: 300,
        },
        {
          id: "r1",
          receiptNo: "GGR-001",
          receiptDate: "2026-11-11",
          status: "DRAFT",
          totalAmount: "350",
        },
      ]),
      onOpen,
    });

    expect(await screen.findByText("GGR-002")).toBeDefined();
    expect(screen.getByText("GGR-001")).toBeDefined();
    expect(screen.getByText(/Đã ghi sổ/)).toBeDefined();
    expect(screen.getByText(/Nháp/)).toBeDefined();

    await userEvent.click(screen.getByText("GGR-001"));
    expect(onOpen).toHaveBeenCalledWith("r1");
  });

  it("báo trống khi đơn chưa có phiếu nhập", async () => {
    renderSection({ load: vi.fn().mockResolvedValue([]), onOpen: vi.fn() });
    expect(await screen.findByText("Chưa có phiếu nhập kho nào")).toBeDefined();
  });

  it("báo lỗi khi không tải được lịch sử", async () => {
    renderSection({
      load: vi.fn().mockRejectedValue(new Error("boom")),
      onOpen: vi.fn(),
    });
    await waitFor(() =>
      expect(screen.getByText("Không tải được lịch sử nhập kho")).toBeDefined(),
    );
  });
});
