import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ chung của khung sơ đồ (thanh công cụ, chú giải, nút xuất), dùng cho mọi host V2. Khóa: `v2.workflowCanvas.*` */
const CHROME_VI: Record<string, string> = {
  "toolbar.zoomIn": "Phóng to",
  "toolbar.zoomOut": "Thu nhỏ",
  "toolbar.fit": "Vừa khung",
  "toolbar.enterFullscreen": "Toàn màn hình",
  "toolbar.exitFullscreen": "Thoát toàn màn hình",
  "toolbar.showRead": "Luồng đọc dữ liệu",
  "toolbar.hideRead": "Ẩn luồng đọc",
  "toolbar.flowsLabel": "Luồng tự động:",
  "toolbar.flowAll": "Tất cả luồng",
  "toolbar.flowAllHint": "Hiển thị mọi luồng, không làm mờ luồng nào",
  "toolbar.canvasLabel": "Sơ đồ:",
  "toolbar.clearSelection": "Bỏ chọn thẻ",
  "legend.step": "Số thứ tự thao tác",
  "legend.solidArrow": "Luồng chính",
  "legend.dashedArrow": "Nhánh phụ",
  "legend.readArrow": "Chỉ đọc dữ liệu",
  "legend.completed": "Hoàn tất",
  "legend.cancelled": "Hủy",
  "drawer.exportPng": "Tải PNG",
  "drawer.exportPdf": "Tải PDF",
};

const CHROME_EN: Record<string, string> = {
  "toolbar.zoomIn": "Zoom in",
  "toolbar.zoomOut": "Zoom out",
  "toolbar.fit": "Fit view",
  "toolbar.enterFullscreen": "Full screen",
  "toolbar.exitFullscreen": "Exit full screen",
  "toolbar.showRead": "Data read flows",
  "toolbar.hideRead": "Hide read flows",
  "toolbar.flowsLabel": "Automatic flows:",
  "toolbar.flowAll": "All flows",
  "toolbar.flowAllHint": "Show every flow, dim none",
  "toolbar.canvasLabel": "Diagram:",
  "toolbar.clearSelection": "Clear selection",
  "legend.step": "Action order",
  "legend.solidArrow": "Main flow",
  "legend.dashedArrow": "Side branch",
  "legend.readArrow": "Read-only data",
  "legend.completed": "Completed",
  "legend.cancelled": "Cancelled",
  "drawer.exportPng": "Download PNG",
  "drawer.exportPdf": "Download PDF",
};

const nest = (flat: Record<string, string>) => {
  const root: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split(".");
    let node = root;
    parts.slice(0, -1).forEach((part) => {
      node = (node[part] ??= {}) as Record<string, unknown>;
    });
    node[parts[parts.length - 1]] = value;
  }
  return root;
};

registerV2ModuleLocale("workflowCanvas", {
  vi: nest(CHROME_VI),
  en: nest(CHROME_EN),
});
