import { useCallback, useState } from "react";

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

import { GUIDE_PAGE_MM } from "./guide/guideLayout";

const A3_MM = { short: 297, long: 420 } as const;
const PAGE_MARGIN_MM = 10;
const EXPORT_PIXEL_RATIO = 2;
const EXPORT_PADDING_PX = 24;
const EXPORT_BACKGROUND = "#ffffff";

export interface WorkflowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Các lớp điều khiển của React Flow không đưa vào ảnh/PDF. */
const EXCLUDED_CLASSES = [
  "react-flow__minimap",
  "react-flow__controls",
  "react-flow__panel",
];

export function buildWorkflowFileName(canvasId: string, date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `garage-workflow-${canvasId}-${yyyy}${mm}${dd}`;
}

/** Khung bao của các hình chữ nhật, cộng padding. */
export function unionBounds(
  rects: WorkflowBounds[],
  padding = EXPORT_PADDING_PX,
): WorkflowBounds {
  if (rects.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));
  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

/** Chọn hướng trang A3 theo tỉ lệ ảnh, rồi co ảnh vừa trang giữ tỉ lệ. */
export function fitImageToPage(
  imageWidth: number,
  imageHeight: number,
  margin: number = PAGE_MARGIN_MM,
): {
  orientation: "landscape" | "portrait";
  pageWidth: number;
  pageHeight: number;
  width: number;
  height: number;
  x: number;
  y: number;
} {
  const landscape = imageWidth >= imageHeight;
  const pageWidth = landscape ? A3_MM.long : A3_MM.short;
  const pageHeight = landscape ? A3_MM.short : A3_MM.long;
  const scale = Math.min(
    (pageWidth - margin * 2) / imageWidth,
    (pageHeight - margin * 2) / imageHeight,
  );
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    orientation: landscape ? "landscape" : "portrait",
    pageWidth,
    pageHeight,
    width,
    height,
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
  };
}

function shouldIncludeNode(node: HTMLElement): boolean {
  if (!node.classList) return true;
  return !EXCLUDED_CLASSES.some((cls) => node.classList.contains(cls));
}

function triggerDownload(href: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
}

/**
 * Chụp toàn bộ sơ đồ: lấy `.react-flow__viewport` và ép kích thước + transform
 * theo khung bao, nên không phụ thuộc zoom/pan hiện tại của canvas.
 */
async function captureGraph(
  container: HTMLElement,
  bounds: WorkflowBounds,
): Promise<string> {
  const viewport = container.querySelector<HTMLElement>(
    ".react-flow__viewport",
  );
  const target = viewport ?? container;
  return toPng(target, {
    filter: shouldIncludeNode,
    pixelRatio: EXPORT_PIXEL_RATIO,
    backgroundColor: EXPORT_BACKGROUND,
    width: bounds.width,
    height: bounds.height,
    style: {
      transform: `translate(${-bounds.x}px, ${-bounds.y}px) scale(1)`,
      transformOrigin: "0 0",
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
    },
  });
}

/** Chụp một trang hướng dẫn (phần tử A4 dựng sẵn) thành ảnh. */
function captureGuidePage(page: HTMLElement): Promise<string> {
  return toPng(page, {
    pixelRatio: EXPORT_PIXEL_RATIO,
    backgroundColor: EXPORT_BACKGROUND,
  });
}

export function useWorkflowExport() {
  const [exporting, setExporting] = useState(false);

  const run = useCallback(
    async (
      container: HTMLElement,
      bounds: WorkflowBounds,
      fileBaseName: string,
      format: "png" | "pdf",
      guidePages: HTMLElement[] = [],
    ) => {
      setExporting(true);
      try {
        const dataUrl = await captureGraph(container, bounds);
        if (format === "png") {
          triggerDownload(dataUrl, `${fileBaseName}.png`);
          return;
        }
        const fitted = fitImageToPage(bounds.width, bounds.height);
        const pdf = new jsPDF({
          orientation: fitted.orientation,
          unit: "mm",
          format: "a3",
        });
        pdf.addImage(
          dataUrl,
          "PNG",
          fitted.x,
          fitted.y,
          fitted.width,
          fitted.height,
        );
        for (const page of guidePages) {
          const pageImage = await captureGuidePage(page);
          pdf.addPage("a4", "portrait");
          pdf.addImage(
            pageImage,
            "PNG",
            0,
            0,
            GUIDE_PAGE_MM.width,
            GUIDE_PAGE_MM.height,
          );
        }
        pdf.save(`${fileBaseName}.pdf`);
      } finally {
        setExporting(false);
      }
    },
    [],
  );

  const exportPng = useCallback(
    (container: HTMLElement, bounds: WorkflowBounds, fileBaseName: string) =>
      run(container, bounds, fileBaseName, "png"),
    [run],
  );

  const exportPdf = useCallback(
    (
      container: HTMLElement,
      bounds: WorkflowBounds,
      fileBaseName: string,
      guidePages: HTMLElement[] = [],
    ) => run(container, bounds, fileBaseName, "pdf", guidePages),
    [run],
  );

  return { exporting, exportPng, exportPdf };
}
