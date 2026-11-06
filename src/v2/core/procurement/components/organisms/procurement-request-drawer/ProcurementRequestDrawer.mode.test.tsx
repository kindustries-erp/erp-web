import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProcurementRequestDrawer } from "./ProcurementRequestDrawer";
import type { ProcurementDrawerProps } from "../../../procurement.drawer.type";
import type { ProcurementRequestDetail } from "../../../procurement.types";

const draftDetail: ProcurementRequestDetail = {
  id: "req-200",
  requestNo: "PR-2026-200",
  requestDate: "2026-11-05",
  neededDate: null,
  title: "Đề nghị mua lốp",
  branchId: "branch-1",
  branchName: "Chi nhánh Hà Nội",
  status: "DRAFT",
  orderingStatus: "NONE",
  createdBy: "Trần Văn B",
  createdAt: "2026-11-05T09:00:00Z",
  remarks: null,
  lines: [
    {
      id: "line-1",
      lineType: "GOODS",
      itemCode: "TIRE-01",
      itemName: "Lốp Michelin",
      qtyRequested: 4,
      estUnitPrice: 2000000,
    },
  ],
};

const renderDrawer = (overrides: Partial<ProcurementDrawerProps> = {}) => {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  const api = {
    get: vi.fn().mockResolvedValue(draftDetail),
    create: vi.fn().mockResolvedValue({ id: "req-new" }),
    updateHeader: vi.fn().mockResolvedValue(undefined),
    replaceLines: vi.fn().mockResolvedValue(undefined),
    list: vi.fn(),
    transition: vi.fn(),
  };
  const props: ProcurementDrawerProps = {
    open: true,
    documentId: "req-200",
    mode: "view",
    canUpdate: true,
    onClose,
    onSaved,
    queryKey: "test-pr-mode",
    api,
    ...overrides,
  };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ProcurementRequestDrawer {...props} />
    </QueryClientProvider>,
  );
  return { onClose, onSaved, api };
};

describe("ProcurementRequestDrawer — chế độ xem/sửa", () => {
  it("ở chế độ xem, bản nháp có nút Chỉnh sửa và chuyển sang chế độ sửa", async () => {
    renderDrawer();
    const editButton = await screen.findByRole("button", {
      name: /chỉnh sửa/i,
    });
    fireEvent.click(editButton);
    expect(
      await screen.findByRole("button", { name: /lưu nháp/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy" })).toBeInTheDocument();
  });

  it("hủy sửa khi chưa đổi gì thì về chế độ xem, không hỏi xác nhận", async () => {
    const { onClose } = renderDrawer({ mode: "edit" });
    fireEvent.click(await screen.findByRole("button", { name: "Hủy" }));
    expect(
      await screen.findByRole("button", { name: /chỉnh sửa/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Bỏ thay đổi?")).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("hủy sửa khi đã đổi thì hỏi xác nhận; đồng ý thì bỏ thay đổi và về chế độ xem", async () => {
    renderDrawer({ mode: "edit" });
    const titleInput = await screen.findByDisplayValue("Đề nghị mua lốp");
    fireEvent.change(titleInput, { target: { value: "Đề nghị khác" } });

    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(await screen.findByText("Bỏ thay đổi?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Bỏ thay đổi" }));
    expect(
      await screen.findByRole("button", { name: /chỉnh sửa/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Đề nghị khác")).not.toBeInTheDocument();
    expect(await screen.findByText("Đề nghị mua lốp")).toBeInTheDocument();
  });

  it("ở chế độ xem, nút chính Gửi duyệt nằm bên phải nút Đóng", async () => {
    renderDrawer({ onTransition: vi.fn() });
    const submit = await screen.findByRole("button", { name: /gửi duyệt/i });
    // Có thêm nút X ở header cùng nhãn "Đóng": lấy nút có chữ "Đóng" ở footer
    const close = screen
      .getAllByRole("button", { name: "Đóng" })
      .find((b) => b.textContent?.trim() === "Đóng") as HTMLElement;
    expect(close).toBeDefined();
    // DOCUMENT_POSITION_FOLLOWING: nút Gửi duyệt đứng sau nút Đóng trong DOM
    expect(
      close.compareDocumentPosition(submit) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("lưu nháp xong quay về chế độ xem (không cần list đổi mode)", async () => {
    renderDrawer({ mode: "edit" });
    await screen.findByDisplayValue("Đề nghị mua lốp");
    fireEvent.click(screen.getByRole("button", { name: /lưu nháp/i }));
    expect(
      await screen.findByRole("button", { name: /chỉnh sửa/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /lưu nháp/i }),
    ).not.toBeInTheDocument();
  });

  it("lưu thành công ở chế độ sửa gọi onSaved với id của bản ghi, không đóng drawer", async () => {
    const { onSaved, onClose, api } = renderDrawer({ mode: "edit" });
    await screen.findByDisplayValue("Đề nghị mua lốp");
    fireEvent.click(screen.getByRole("button", { name: /lưu nháp/i }));
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith("req-200"));
    expect(api.updateHeader).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
