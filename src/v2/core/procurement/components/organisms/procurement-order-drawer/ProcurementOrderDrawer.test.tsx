import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProcurementOrderDrawer } from "./ProcurementOrderDrawer";
import type { ProcurementDrawerProps } from "../../../procurement.drawer.type";
import type { ProcurementOrderDetail } from "../../../procurement.types";

const draftOrder = {
  id: "po-1",
  orderNo: "PO-2026-1",
  status: "DRAFT",
  branchId: "b1",
  branchName: "Chi nhánh Hà Nội",
  orderDate: "2026-11-05",
  expectedDate: null,
  supplierId: "s1",
  supplierName: "NCC A",
  remarks: "Ghi chú gốc",
  supplierInvoiceNo: null,
  requestId: null,
  paymentStatus: "UNPAID",
  lines: [],
} as unknown as ProcurementOrderDetail;

const renderDrawer = (overrides: Partial<ProcurementDrawerProps> = {}) => {
  const onClose = vi.fn();
  const api = {
    get: vi.fn().mockResolvedValue(draftOrder),
    create: vi.fn(),
    updateHeader: vi.fn(),
    replaceLines: vi.fn(),
    list: vi.fn(),
    transition: vi.fn(),
  };
  const props: ProcurementDrawerProps = {
    open: true,
    documentId: "po-1",
    mode: "view",
    canUpdate: true,
    onClose,
    queryKey: "test-po-mode",
    api,
    ...overrides,
  };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const { container } = render(
    <QueryClientProvider client={client}>
      <ProcurementOrderDrawer {...props} />
    </QueryClientProvider>,
  );
  return { onClose, container };
};

describe("ProcurementOrderDrawer — chế độ xem/sửa", () => {
  it("ở chế độ xem, đơn nháp có nút Chỉnh sửa và tiêu đề Đơn mua hàng", async () => {
    renderDrawer();
    expect(
      await screen.findByRole("button", { name: /chỉnh sửa/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Đơn mua hàng")).toBeInTheDocument();
  });

  it("ở chế độ sửa hiện Hủy và Lưu nháp, tiêu đề Sửa đơn mua hàng", async () => {
    renderDrawer({ mode: "edit" });
    expect(
      await screen.findByRole("button", { name: /lưu nháp/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy" })).toBeInTheDocument();
    expect(screen.getByText("Sửa đơn mua hàng")).toBeInTheDocument();
  });

  it("hủy sửa khi đã đổi ghi chú thì hỏi xác nhận trước khi về chế độ xem", async () => {
    renderDrawer({ mode: "edit" });
    await screen.findByRole("button", { name: /lưu nháp/i });
    fireEvent.change(await screen.findByDisplayValue("Ghi chú gốc"), {
      target: { value: "Ghi chú mới" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(await screen.findByText("Bỏ thay đổi?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bỏ thay đổi" }));
    expect(
      await screen.findByRole("button", { name: /chỉnh sửa/i }),
    ).toBeInTheDocument();
  });

  it("hủy sửa khi chưa đổi gì thì về chế độ xem ngay, không gọi onClose", async () => {
    const { onClose } = renderDrawer({ mode: "edit" });
    fireEvent.click(await screen.findByRole("button", { name: "Hủy" }));
    expect(
      await screen.findByRole("button", { name: /chỉnh sửa/i }),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
