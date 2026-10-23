import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { V2StandardTableDesktop } from "../desktop/V2StandardTable.desktop";
import { mockViewport, renderTable } from "../mocks/V2StandardTable.fixture";
import type { V2TableToolbarConfig } from "../V2StandardTable.type";

const makeConfig = (): V2TableToolbarConfig => ({
  filterGroup: {
    items: [
      { key: "all", label: "Tất cả" },
      { key: "new", label: "Mới" },
    ],
    activeKey: "all",
    onChange: vi.fn(),
  },
  viewModes: {
    items: [{ key: "overview", label: "Tổng quan", isSystem: true }],
    activeKey: "overview",
    onSelect: vi.fn(),
  },
});

/** Chế độ xem tùy chỉnh: tạo qua hộp thoại, xóa qua xác nhận */
describe("V2StandardTable toolbar: chế độ xem tùy chỉnh", () => {
  beforeEach(() => {
    mockViewport(false);
    window.localStorage.clear();
  });
  afterEach(() => vi.restoreAllMocks());

  it("tạo chế độ xem qua hộp thoại rồi thấy trong danh sách", () => {
    renderTable(V2StandardTableDesktop, { toolbar: makeConfig() });
    fireEvent.click(screen.getByRole("button", { name: "Chế độ xem" }));
    fireEvent.click(screen.getByRole("button", { name: "Tạo chế độ xem mới" }));
    fireEvent.change(screen.getByRole("textbox", { name: /Tên chế độ xem/ }), {
      target: { value: "Của tôi" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(
      screen.getByRole("button", { name: "Chế độ xem" }),
    ).toHaveTextContent("Của tôi");
    fireEvent.click(screen.getByRole("button", { name: "Chế độ xem" }));
    expect(screen.getByRole("option", { name: /Của tôi/ })).toBeInTheDocument();
  });

  it("xóa chế độ xem tùy chỉnh phải qua xác nhận", () => {
    renderTable(V2StandardTableDesktop, { toolbar: makeConfig() });
    fireEvent.click(screen.getByRole("button", { name: "Chế độ xem" }));
    fireEvent.click(screen.getByRole("button", { name: "Tạo chế độ xem mới" }));
    fireEvent.change(screen.getByRole("textbox", { name: /Tên chế độ xem/ }), {
      target: { value: "Tạm" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    fireEvent.click(screen.getByRole("button", { name: "Chế độ xem" }));
    fireEvent.click(screen.getByRole("button", { name: "Xóa chế độ xem" }));
    expect(
      screen.getByText("Bạn chắc chắn muốn xóa chế độ xem này?"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(
      screen.getByRole("button", { name: "Chế độ xem" }),
    ).toHaveTextContent("Tạm");

    fireEvent.click(screen.getByRole("button", { name: "Chế độ xem" }));
    const deleteButtons = screen.getAllByRole("button", {
      name: "Xóa chế độ xem",
    });
    fireEvent.click(deleteButtons[0]);
    const confirmButtons = screen.getAllByRole("button", {
      name: "Xóa chế độ xem",
    });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);
    expect(
      screen.getByRole("button", { name: "Chế độ xem" }),
    ).toHaveTextContent("Tổng quan");
  });
});
