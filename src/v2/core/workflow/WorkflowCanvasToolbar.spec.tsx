import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";

import {
  WorkflowCanvasToolbar,
  type WorkflowCanvasToolbarLabels,
} from "./WorkflowCanvasToolbar";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback ?? key,
}));

const LABELS: WorkflowCanvasToolbarLabels = {
  zoomIn: "Phóng to",
  zoomOut: "Thu nhỏ",
  fit: "Vừa khung",
  enterFullscreen: "Toàn màn hình",
  exitFullscreen: "Thoát toàn màn hình",
  showRead: "Luồng đọc dữ liệu",
  hideRead: "Ẩn luồng đọc",
  step: "Số thứ tự",
  solidArrow: "Luồng chính",
  dashedArrow: "Cần xác minh",
  readArrow: "Chỉ đọc",
  completed: "Kết thúc",
  cancelled: "Hủy",
  canvasLabel: "Sơ đồ:",
  flowsLabel: "Luồng tự động:",
  flowAll: "Tất cả luồng",
  flowAllHint: "Hiển thị mọi luồng",
  clearSelection: "Bỏ chọn thẻ",
};

const FLOWS = [
  {
    id: "forecast",
    letter: "A",
    color: "#059669",
    title: "Sinh Dự thu",
    description: "Tự sinh Dự thu khi phiếu Kết thúc",
  },
  {
    id: "opex",
    letter: "B",
    color: "#EA580C",
    title: "Ghi OPEX",
    description: "Tự ghi OPEX khi lưu phiếu chi",
  },
];

function renderToolbar(
  overrides: Partial<React.ComponentProps<typeof WorkflowCanvasToolbar>> = {},
) {
  const props: React.ComponentProps<typeof WorkflowCanvasToolbar> = {
    isFullscreen: false,
    onToggleFullscreen: vi.fn(),
    showReadEdges: false,
    onToggleReadEdges: vi.fn(),
    hasReadEdges: true,
    labels: LABELS,
    canvasOptions: [
      { value: "end-user", label: "Người dùng cuối" },
      { value: "dev", label: "Kỹ thuật (Dev)" },
    ],
    activeCanvasId: "end-user",
    onSelectCanvas: vi.fn(),
    flows: FLOWS,
    activeFlow: null,
    onSelectFlow: vi.fn(),
    hasSelectedNode: false,
    onClearSelection: vi.fn(),
    ...overrides,
  };
  render(
    <ReactFlowProvider>
      <WorkflowCanvasToolbar {...props} />
    </ReactFlowProvider>,
  );
  return props;
}

describe("WorkflowCanvasToolbar", () => {
  it("hiện dropdown Sơ đồ và dropdown Luồng tự động cùng một hàng với các nút", () => {
    renderToolbar();

    expect(screen.getByText("Sơ đồ:")).toBeInTheDocument();
    expect(screen.getByText("Người dùng cuối")).toBeInTheDocument();
    expect(screen.getByText("Luồng tự động:")).toBeInTheDocument();
    expect(screen.getByText("Tất cả luồng")).toBeInTheDocument();
    expect(screen.getByText("Vừa khung")).toBeInTheDocument();
    expect(screen.getByText("Toàn màn hình")).toBeInTheDocument();
  });

  it("dropdown luồng hiện luồng đang làm nổi", () => {
    renderToolbar({ activeFlow: "opex" });

    expect(screen.getByText("B. Ghi OPEX")).toBeInTheDocument();
  });

  it("không có flows thì ẩn dropdown luồng", () => {
    renderToolbar({ flows: undefined });

    expect(screen.queryByText("Luồng tự động:")).not.toBeInTheDocument();
  });

  it("chưa chọn thẻ thì không hiện nút Bỏ chọn thẻ", () => {
    renderToolbar();

    expect(screen.queryByText("Bỏ chọn thẻ")).not.toBeInTheDocument();
  });

  it("đang chọn thẻ thì hiện nút Bỏ chọn thẻ, bấm sẽ gọi onClearSelection", () => {
    const props = renderToolbar({ hasSelectedNode: true });

    fireEvent.click(screen.getByText("Bỏ chọn thẻ"));

    expect(props.onClearSelection).toHaveBeenCalledTimes(1);
  });

  it("bấm Toàn màn hình gọi onToggleFullscreen", () => {
    const props = renderToolbar();

    fireEvent.click(screen.getByText("Toàn màn hình"));

    expect(props.onToggleFullscreen).toHaveBeenCalledTimes(1);
  });
});
