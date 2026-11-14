import type {
  WorkflowCanvasToolbarLabels,
  WorkflowToolbarFlow,
} from "./WorkflowCanvasToolbar";
import type { WorkflowCanvasDefinition } from "./workflowTypes";

type Translate = (key: string, fallback: string) => string;

/** Chữ trên thanh công cụ và chú giải; key `workflow.*` do host ánh xạ sang locale của mình. */
export function buildToolbarLabels(t: Translate): WorkflowCanvasToolbarLabels {
  return {
    zoomIn: t("workflow.toolbar.zoomIn", "Phóng to"),
    zoomOut: t("workflow.toolbar.zoomOut", "Thu nhỏ"),
    fit: t("workflow.toolbar.fit", "Vừa khung"),
    enterFullscreen: t("workflow.toolbar.enterFullscreen", "Toàn màn hình"),
    exitFullscreen: t("workflow.toolbar.exitFullscreen", "Thoát toàn màn hình"),
    showRead: t("workflow.toolbar.showRead", "Luồng đọc dữ liệu"),
    hideRead: t("workflow.toolbar.hideRead", "Ẩn luồng đọc"),
    step: t("workflow.legend.step", "Số thứ tự thao tác"),
    solidArrow: t("workflow.legend.solidArrow", "Luồng chính"),
    dashedArrow: t("workflow.legend.dashedArrow", "Cần xác minh"),
    readArrow: t("workflow.legend.readArrow", "Chỉ đọc dữ liệu"),
    completed: t("workflow.legend.completed", "Kết thúc (mã 3)"),
    cancelled: t("workflow.legend.cancelled", "Hủy (mã 9)"),
    canvasLabel: t("workflow.toolbar.canvasLabel", "Sơ đồ:"),
    flowsLabel: t("workflow.toolbar.flowsLabel", "Luồng tự động:"),
    flowAll: t("workflow.toolbar.flowAll", "Tất cả luồng"),
    flowAllHint: t(
      "workflow.toolbar.flowAllHint",
      "Hiển thị mọi luồng, không làm mờ luồng nào",
    ),
    clearSelection: t("workflow.toolbar.clearSelection", "Bỏ chọn thẻ"),
  };
}

/** Các luồng tự động đã dịch cho dropdown trên toolbar. */
export function buildToolbarFlows(
  canvas: WorkflowCanvasDefinition,
  t: Translate,
): WorkflowToolbarFlow[] {
  return (canvas.flows ?? []).map((flow) => ({
    id: flow.id,
    letter: flow.letter,
    color: flow.color,
    title: t(flow.title.key, flow.title.fallback),
    description: t(flow.description.key, flow.description.fallback),
  }));
}
