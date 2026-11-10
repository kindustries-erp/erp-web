import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProcurementOrderDrawer } from "./ProcurementOrderDrawer";
import type { ProcurementDrawerProps } from "../../../procurement.drawer.type";
import type { ProcurementOrderDetail } from "../../../procurement.types";

// Quyền đọc đề nghị được điều khiển từ test; mặc định có quyền
const perm = vi.hoisted(() => ({ allowed: true }));
vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: () => perm.allowed,
}));

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

  it("hiển thị phân vùng Nhật ký duyệt khi xem đơn đã lưu", async () => {
    renderDrawer({ documentId: "po-1" });
    expect(await screen.findByText("Nhật ký duyệt")).toBeInTheDocument();
  });
});

const purchaseRequest = {
  id: "r1",
  requestNo: "GDNM-20261105-001",
  title: "Mua lốp",
  status: "APPROVED",
  orderingStatus: "NONE",
  branchId: "b1",
  branchName: "Chi nhánh Quận 1",
  requestDate: "2026-11-05",
  neededDate: null,
  remarks: null,
  createdBy: null,
  createdAt: "2026-11-05T00:00:00Z",
  lines: [],
};

const purchaseDraft = {
  requestId: "r1",
  requestNo: "GDNM-20261105-001",
  lines: [
    {
      requestLineId: "rl1",
      lineNo: 1,
      lineType: "GOODS",
      itemId: null,
      itemCode: "L-1",
      itemName: "Lốp xe",
      description: null,
      qtyRemaining: 2,
      estUnitPrice: 100,
    },
  ],
};

const renderCreate = (overrides: Partial<ProcurementDrawerProps> = {}) => {
  const requestApi = {
    get: vi.fn().mockResolvedValue(purchaseRequest),
    poDraft: vi.fn().mockResolvedValue(purchaseDraft),
    list: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  };
  const api = {
    get: vi.fn(),
    create: vi.fn(),
    updateHeader: vi.fn(),
    replaceLines: vi.fn(),
    list: vi.fn(),
    transition: vi.fn(),
  };
  const props = {
    open: true,
    documentId: null,
    mode: "edit",
    canUpdate: true,
    onClose: vi.fn(),
    queryKey: "test-po-request-picker",
    api,
    requestApi,
    ...overrides,
  } as unknown as ProcurementDrawerProps;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ProcurementOrderDrawer {...props} />
    </QueryClientProvider>,
  );
  return { requestApi };
};

describe("ProcurementOrderDrawer — đề nghị mua tùy chọn (Garage)", () => {
  it("có quyền đọc đề nghị thì hiện ô Từ đề nghị mua khi tạo mới", async () => {
    perm.allowed = true;
    renderCreate({ requestPickerCollection: "garage_procurement_requests" });
    expect(await screen.findByText("Từ đề nghị mua")).toBeInTheDocument();
  });

  it("không có quyền đọc đề nghị thì ẩn ô, vẫn tạo PO trực tiếp được", async () => {
    perm.allowed = false;
    renderCreate({ requestPickerCollection: "garage_procurement_requests" });
    await screen.findByRole("button", { name: /lưu nháp/i });
    expect(screen.queryByText("Từ đề nghị mua")).toBeNull();
    perm.allowed = true;
  });

  it("xem đơn đã lưu thì không hiện ô chọn đề nghị", async () => {
    perm.allowed = true;
    renderDrawer({
      documentId: "po-1",
      requestPickerCollection: "garage_procurement_requests",
    });
    expect(await screen.findByText("Nhật ký duyệt")).toBeInTheDocument();
    expect(screen.queryByText("Từ đề nghị mua")).toBeNull();
  });

  it("mở từ đề nghị: dòng do đề nghị điền sẵn và không thêm hay xóa được dòng", async () => {
    renderCreate({ fromRequestId: "r1" });
    expect(await screen.findByDisplayValue("Lốp xe")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /thêm dòng/i })).toBeNull(),
    );
    expect(screen.queryByRole("button", { name: /xóa dòng/i })).toBeNull();
  });
});
