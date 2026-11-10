import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createInitialQuery } from "../utils/v2TableQuery";
import { toPresetQuery } from "../utils/v2FilterPresets";
import type { V2FilterPresetEditorSource } from "../hooks/V2StandardTable.filterpresets.hook";
import { V2FilterPresetDialog } from "./V2StandardTable.filterdialog";

const groupOptions = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
];

const source = (
  tableQuery = createInitialQuery({ pageSize: 20 }),
): V2FilterPresetEditorSource => ({
  tableId: "dialog-test",
  columns: [],
  fetchOptionsForKey: () => undefined,
  filtersStrForQuery: () => undefined,
  tableQuery,
});

const EMPTY_ERROR = "Thêm ít nhất một điều kiện lọc để lưu";

const renderDialog = (
  overrides: Partial<Parameters<typeof V2FilterPresetDialog>[0]> = {},
) => {
  const props = {
    mode: "create" as const,
    initialLabel: "",
    initialGroupKey: "all",
    groupOptions,
    source: source(),
    isNameTaken: vi.fn(() => false),
    onSubmit: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <V2FilterPresetDialog {...props} />
    </QueryClientProvider>,
  );
  return props;
};

const nameInput = () => screen.getByLabelText(/Tên bộ lọc/);
const saveButton = () => screen.getByRole("button", { name: "Lưu" });

describe("V2FilterPresetDialog", () => {
  it("hiện tên, nền bộ lọc có sẵn và mục điều kiện lọc", () => {
    renderDialog({ initialGroupKey: "pending", initialLabel: "Đang chờ" });

    expect(nameInput()).toHaveValue("Đang chờ");
    expect(screen.getByText("Chờ duyệt")).toBeInTheDocument();
    expect(screen.getByText("Điều kiện lọc")).toBeInTheDocument();
  });

  it("báo lỗi khi bỏ trống tên và không gọi onSubmit", () => {
    const props = renderDialog();

    fireEvent.click(saveButton());

    expect(screen.getByText("Vui lòng nhập tên bộ lọc")).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("báo lỗi khi tên trùng", () => {
    const props = renderDialog({ isNameTaken: vi.fn(() => true) });

    fireEvent.change(nameInput(), { target: { value: "Đã có" } });
    fireEvent.click(saveButton());

    expect(screen.getByText("Tên bộ lọc đã tồn tại")).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("chặn lưu khi chưa có điều kiện, dù nền khác Tất cả", () => {
    const props = renderDialog({ initialGroupKey: "pending" });

    fireEvent.change(nameInput(), { target: { value: "Chỉ nền" } });
    fireEvent.click(saveButton());

    expect(screen.getByText(EMPTY_ERROR)).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("chặn lưu khi nền là Tất cả và không có điều kiện", () => {
    const props = renderDialog({ initialGroupKey: "all" });

    fireEvent.change(nameInput(), { target: { value: "Trống" } });
    fireEvent.click(saveButton());

    expect(screen.getByText(EMPTY_ERROR)).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("tạo mới: lấy điều kiện đang áp dụng của bảng làm bản nháp", () => {
    const tableQuery = createInitialQuery({ pageSize: 20, search: "PO" });
    const props = renderDialog({
      initialGroupKey: "pending",
      source: source(tableQuery),
    });

    fireEvent.change(nameInput(), { target: { value: "  Có PO  " } });
    fireEvent.click(saveButton());

    expect(props.onSubmit).toHaveBeenCalledWith({
      label: "Có PO",
      groupKey: "pending",
      query: toPresetQuery(tableQuery),
    });
  });

  it("có điều kiện thì lưu được dù nền là Tất cả", () => {
    const tableQuery = createInitialQuery({ pageSize: 20, search: "PO" });
    const props = renderDialog({
      initialGroupKey: "all",
      source: source(tableQuery),
    });

    fireEvent.change(nameInput(), { target: { value: "Có PO" } });
    fireEvent.click(saveButton());

    expect(props.onSubmit).toHaveBeenCalledWith({
      label: "Có PO",
      groupKey: "all",
      query: toPresetQuery(tableQuery),
    });
  });

  it("sửa: giữ điều kiện đã lưu làm bản nháp khi không đổi gì", () => {
    const saved = toPresetQuery(
      createInitialQuery({ pageSize: 20, search: "đã lưu" }),
    );
    const props = renderDialog({
      mode: "edit",
      initialLabel: "Cũ",
      initialGroupKey: "pending",
      initialQuery: saved,
    });

    fireEvent.change(nameInput(), { target: { value: "Mới" } });
    fireEvent.click(saveButton());

    expect(props.onSubmit).toHaveBeenCalledWith({
      label: "Mới",
      groupKey: "pending",
      query: saved,
    });
  });
});
