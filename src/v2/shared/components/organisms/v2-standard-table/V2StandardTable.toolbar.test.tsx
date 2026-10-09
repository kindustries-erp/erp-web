import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, within } from "@testing-library/react";
import {
  V2PageTabsContext,
  V2TabPanel,
} from "@/v2/shared/components/molecules/v2-tab-panel";
import { V2StandardTableDesktop } from "./V2StandardTable.desktop";
import { mockViewport, renderTable } from "./V2StandardTable.fixture";
import type { DemoRow } from "./V2StandardTable.fixture";
import type {
  V2StandardTableProps,
  V2TableToolbarConfig,
} from "./V2StandardTable.type";

const makeConfig = (
  overrides: Partial<V2TableToolbarConfig> = {},
): V2TableToolbarConfig => ({
  pillTabs: {
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
  onFilterToggle: vi.fn(),
  onRefresh: vi.fn(),
  create: { label: "Đồng bộ", onClick: vi.fn() },
  ...overrides,
});

describe("V2StandardTable toolbar", () => {
  beforeEach(() => mockViewport(false));
  afterEach(() => vi.restoreAllMocks());

  it("không có `toolbar` thì giữ giao diện cũ (không có nút làm mới)", () => {
    renderTable(V2StandardTableDesktop);
    expect(screen.queryByRole("button", { name: "Làm mới" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Tùy chỉnh cột" }),
    ).toBeInTheDocument();
  });

  it("inline: đủ cụm nút và các callback chạy", () => {
    const config = makeConfig();
    renderTable(V2StandardTableDesktop, { toolbar: config });
    expect(screen.getByRole("tab", { name: "Mới" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Chế độ xem" }),
    ).toHaveTextContent("Tổng quan");
    fireEvent.click(screen.getByRole("button", { name: "Bộ lọc" }));
    fireEvent.click(screen.getByRole("button", { name: "Làm mới" }));
    fireEvent.click(screen.getByRole("button", { name: "Đồng bộ" }));
    fireEvent.click(screen.getByRole("tab", { name: "Mới" }));
    expect(config.onFilterToggle).toHaveBeenCalled();
    expect(config.onRefresh).toHaveBeenCalled();
    expect(config.create?.onClick).toHaveBeenCalled();
    expect(config.pillTabs?.onChange).toHaveBeenCalledWith("new");
    expect(
      screen.getByRole("button", { name: "Tùy chỉnh cột" }),
    ).toBeInTheDocument();
  });

  it("4 nút icon (Lọc, Cột, Toàn màn hình, Làm mới) cùng một kiểu", () => {
    renderTable(V2StandardTableDesktop, { toolbar: makeConfig() });
    const names = ["Bộ lọc", "Tùy chỉnh cột", "Toàn màn hình", "Làm mới"];
    const classes = names.map(
      (n) => screen.getByRole("button", { name: n }).className,
    );
    for (const cls of classes) {
      expect(cls).toContain("h-8");
      expect(cls).toContain("w-8");
      expect(cls).toContain("border-input");
    }
  });

  it("chip (N) chỉ hiện khi có dòng chọn và ✕ bỏ chọn tất cả", () => {
    renderTable(V2StandardTableDesktop, {
      toolbar: makeConfig(),
      enableRowSelection: true,
    });
    expect(screen.queryByText("(2)")).toBeNull();
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes[1]);
    fireEvent.click(boxes[2]);
    expect(screen.getByText("(2)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bỏ chọn (2)" }));
    expect(screen.queryByText("(2)")).toBeNull();
  });

  it("fullscreen: bật/tắt bằng nút và ESC, có thể tắt bằng enableFullscreen=false", () => {
    const { container, unmount } = renderTable(V2StandardTableDesktop, {
      toolbar: makeConfig(),
    });
    fireEvent.click(screen.getByRole("button", { name: "Toàn màn hình" }));
    expect(container.firstElementChild).toHaveClass("fixed", "inset-0");
    expect(
      screen.getByRole("button", { name: "Thoát toàn màn hình" }),
    ).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(container.firstElementChild).not.toHaveClass("fixed");
    unmount();
    renderTable(V2StandardTableDesktop, {
      toolbar: makeConfig({ enableFullscreen: false }),
    });
    expect(screen.queryByRole("button", { name: "Toàn màn hình" })).toBeNull();
  });

  describe("trong template có slot", () => {
    const slot = document.createElement("div");
    const InSlot = (p: V2StandardTableProps<DemoRow>) => (
      <V2PageTabsContext.Provider
        value={{ activeTab: "in", slots: { in: slot } }}
      >
        <V2TabPanel tabKey="in">
          <V2StandardTableDesktop {...p} />
        </V2TabPanel>
      </V2PageTabsContext.Provider>
    );

    beforeEach(() => document.body.appendChild(slot));
    afterEach(() => slot.remove());

    it("toolbar portal vào slot header, không nằm trong bảng", () => {
      const { container } = renderTable(InSlot, { toolbar: makeConfig() });
      expect(
        within(slot).getByRole("button", { name: "Làm mới" }),
      ).toBeInTheDocument();
      expect(
        within(container).queryByRole("button", { name: "Làm mới" }),
      ).toBeNull();
    });

    it("không có `toolbar` nhưng có slot: nút cột portal lên header, không nằm dưới bảng", () => {
      const { container } = renderTable(InSlot);
      expect(
        within(slot).getByRole("button", { name: "Tùy chỉnh cột" }),
      ).toBeInTheDocument();
      expect(
        within(container).queryByRole("button", { name: "Tùy chỉnh cột" }),
      ).toBeNull();
    });

    it("vào fullscreen thì toolbar quay về inline trong bảng", () => {
      const { container } = renderTable(InSlot, { toolbar: makeConfig() });
      fireEvent.click(
        within(slot).getByRole("button", { name: "Toàn màn hình" }),
      );
      expect(
        within(slot).queryByRole("button", { name: "Làm mới" }),
      ).toBeNull();
      expect(
        within(container).getByRole("button", { name: "Làm mới" }),
      ).toBeInTheDocument();
    });
  });
});
