import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { V2StandardTableDesktop } from "./V2StandardTable.desktop";
import {
  demoFetchOptions,
  mockViewport,
  renderTable,
} from "./V2StandardTable.fixture";
import type { V2TableToolbarConfig } from "./V2StandardTable.type";

const withPanel = (
  filterPanel: V2TableToolbarConfig["filterPanel"] = {},
  extra: Partial<V2TableToolbarConfig> = {},
): V2TableToolbarConfig => ({ filterPanel, ...extra });

const panel = () => screen.queryByRole("complementary", { name: "Bộ lọc" });

describe("V2StandardTable filter panel", () => {
  beforeEach(() => {
    mockViewport(false);
    vi.mocked(demoFetchOptions).mockClear();
  });
  afterEach(() => vi.restoreAllMocks());

  it("không cấu hình filterPanel thì không có panel", () => {
    renderTable(V2StandardTableDesktop, {
      toolbar: { onFilterToggle: vi.fn() },
    });
    fireEvent.click(screen.getByRole("button", { name: "Bộ lọc" }));
    expect(panel()).toBeNull();
  });

  it("nút Lọc mở panel, ✕ đóng panel, vẫn gọi onFilterToggle", () => {
    const onFilterToggle = vi.fn();
    renderTable(V2StandardTableDesktop, {
      toolbar: withPanel({}, { onFilterToggle }),
    });
    expect(panel()).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Bộ lọc" }));
    expect(panel()).toBeInTheDocument();
    expect(onFilterToggle).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Đóng bộ lọc" }));
    expect(panel()).toBeNull();
  });

  it("defaultOpen mở sẵn; controlled thì theo prop và báo onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { unmount } = renderTable(V2StandardTableDesktop, {
      toolbar: withPanel({ defaultOpen: true }),
    });
    expect(panel()).toBeInTheDocument();
    unmount();
    renderTable(V2StandardTableDesktop, {
      toolbar: withPanel({ open: false, onOpenChange }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Bộ lọc" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(panel()).toBeNull();
  });

  it("liệt kê card cho mọi cột có filter và tìm cột thu hẹp danh sách", () => {
    renderTable(V2StandardTableDesktop, {
      toolbar: withPanel({ defaultOpen: true }),
    });
    const p = panel() as HTMLElement;
    expect(within(p).getByText("Bộ lọc theo cột (4)")).toBeInTheDocument();
    fireEvent.change(within(p).getByLabelText("Tìm cột cần lọc..."), {
      target: { value: "ngày" },
    });
    expect(within(p).getByText("Bộ lọc theo cột (1)")).toBeInTheDocument();
    fireEvent.change(within(p).getByLabelText("Tìm cột cần lọc..."), {
      target: { value: "zzz" },
    });
    expect(within(p).getByText("Không có cột phù hợp")).toBeInTheDocument();
  });

  it("chỉ card đang mở mới gọi fetchOptions, mở card khác thì đóng card cũ", async () => {
    renderTable(V2StandardTableDesktop, {
      toolbar: withPanel({ defaultOpen: true }),
    });
    expect(demoFetchOptions).not.toHaveBeenCalled();
    const p = panel() as HTMLElement;
    fireEvent.click(within(p).getByRole("button", { name: /Mã/ }));
    await waitFor(() => expect(demoFetchOptions).toHaveBeenCalled());
    const calls = vi.mocked(demoFetchOptions).mock.calls;
    expect(calls.every(([params]) => params.columnKey === "code")).toBe(true);
    fireEvent.click(within(p).getByRole("button", { name: /^Tên/ }));
    expect(within(p).getByRole("button", { name: /Mã/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(within(p).getByRole("button", { name: /^Tên/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("áp dụng lọc trong card: cập nhật query, badge, chip; gỡ chip và xóa tất cả", async () => {
    const onQueryChange = vi.fn();
    renderTable(V2StandardTableDesktop, {
      onQueryChange,
      toolbar: withPanel({ defaultOpen: true }),
    });
    const p = panel() as HTMLElement;
    fireEvent.click(within(p).getByRole("button", { name: /Mã/ }));
    const option = await within(p).findByText("HD-001");
    fireEvent.click(option);
    fireEvent.click(within(p).getByRole("button", { name: "Áp dụng" }));
    await waitFor(() =>
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ columnFilters: { code: ["HD-001"] } }),
      ),
    );
    expect(within(p).getByText("(1)")).toBeInTheDocument();
    expect(within(p).getByText("Đang lọc (1)")).toBeInTheDocument();
    expect(screen.getByTestId("toolbar-icon-badge")).toHaveTextContent("1");

    fireEvent.click(within(p).getByRole("button", { name: "Gỡ bộ lọc: Mã" }));
    await waitFor(() =>
      expect(within(p).queryByText("Đang lọc (1)")).toBeNull(),
    );
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ columnFilters: {} }),
    );
  });

  it("nút xóa tất cả trong header panel reset mọi lọc", async () => {
    renderTable(V2StandardTableDesktop, {
      initialQuery: {
        pageSize: 20,
        columnFilters: { code: ["HD-001"], name: ["Alpha"] },
      },
      toolbar: withPanel({ defaultOpen: true }),
    });
    const p = panel() as HTMLElement;
    expect(within(p).getByText("(2)")).toBeInTheDocument();
    fireEvent.click(
      within(p).getByRole("button", { name: "Xóa tất cả bộ lọc" }),
    );
    await waitFor(() => expect(within(p).queryByText("(2)")).toBeNull());
  });

  it("extraContent hiện trên danh sách cột", () => {
    renderTable(V2StandardTableDesktop, {
      toolbar: withPanel({
        defaultOpen: true,
        extraContent: <div>Bộ lọc kỳ</div>,
      }),
    });
    expect(screen.getByText("Bộ lọc kỳ")).toBeInTheDocument();
  });
});
