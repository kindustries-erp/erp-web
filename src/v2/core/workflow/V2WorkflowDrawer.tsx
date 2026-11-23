import React, { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Network } from "lucide-react";

import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";

import { canvasBounds } from "./canvasBounds";
import { buildGuide, flattenGuide } from "./guide/buildGuide";
import type { GuideSource, GuideUnit } from "./guide/guideTypes";
import { WorkflowGuideDocument } from "./guide/WorkflowGuideDocument";
import { buildWorkflowFileName, useWorkflowExport } from "./useWorkflowExport";
import { WorkflowCanvas } from "./WorkflowCanvas";
import type { WorkflowCanvasOption } from "./WorkflowCanvasToolbar";
import type { WorkflowCanvasDefinition } from "./workflowTypes";

export interface V2WorkflowDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Các sơ đồ theo id và thứ tự hiển thị trong ô chọn; phần tử đầu là mặc định. */
  canvases: Record<string, WorkflowCanvasDefinition>;
  order: string[];
  /** Sơ đồ mở sẵn (mặc định là phần tử đầu của `order`). */
  initialCanvasId?: string;
  title: string;
  subtitle?: string;
  /** Nhãn ngắn của từng sơ đồ trong ô chọn (mặc định lấy tiêu đề sơ đồ). */
  canvasLabels?: Record<string, string>;
  /** Hàm dịch của host: nhận key và chuỗi mặc định (host tự quyết định namespace hoặc tiền tố). */
  t: (key: string, fallback: string) => string;
  /** Nội dung tài liệu hướng dẫn kèm file PDF. Không có thì PDF chỉ chứa sơ đồ. */
  guide?: GuideSource;
}

/** Chờ 2 frame để React vẽ lại canvas (có khối tiêu đề) và xyflow đo lại node. */
function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/**
 * Drawer xem sơ đồ quy trình dùng chung (V2): chọn sơ đồ ngay trên toolbar của canvas,
 * toàn màn hình, xuất PNG/PDF. Dữ liệu sơ đồ, chữ và tài liệu hướng dẫn do host cấp.
 */
export function V2WorkflowDrawer({
  open,
  onClose,
  canvases,
  order,
  initialCanvasId,
  title,
  subtitle,
  canvasLabels,
  t,
  guide: guideSource,
}: V2WorkflowDrawerProps) {
  const [activeId, setActiveId] = useState<string>(
    initialCanvasId && order.includes(initialCanvasId)
      ? initialCanvasId
      : order[0],
  );
  const [exporting, setExporting] = useState(false);
  const [showReadById, setShowReadById] = useState<Record<string, boolean>>({});
  const [guide, setGuide] = useState<{
    units: GuideUnit[];
    headerTitle: string;
  } | null>(null);
  const guideResolver = useRef<((pages: HTMLElement[]) => void) | null>(null);
  const captureElement = useRef<HTMLDivElement | null>(null);
  const { exporting: capturing, exportPng, exportPdf } = useWorkflowExport();

  const setCaptureElement = useCallback((element: HTMLDivElement | null) => {
    captureElement.current = element;
  }, []);

  const canvasOptions = useMemo<WorkflowCanvasOption[]>(
    () =>
      order.map((id) => {
        const canvas = canvases[id];
        const name = t(canvas.title.key, canvas.title.fallback);
        const description = t(
          canvas.description.key,
          canvas.description.fallback,
        );
        return {
          value: id,
          label: canvasLabels?.[id] ?? name,
          description: `${name}: ${description}`,
        };
      }),
    [canvasLabels, canvases, order, t],
  );

  const handleSelectCanvas = useCallback(
    (value: string) => {
      if (order.includes(value)) setActiveId(value);
    },
    [order],
  );

  const handleToggleRead = useCallback(() => {
    setShowReadById((prev) => ({ ...prev, [activeId]: !prev[activeId] }));
  }, [activeId]);

  const handleGuidePagesReady = useCallback((pages: HTMLElement[]) => {
    guideResolver.current?.(pages);
    guideResolver.current = null;
  }, []);

  /** Dựng tài liệu hướng dẫn ẩn và chờ các trang A4 sẵn sàng để chụp; không có tài liệu thì trả mảng rỗng. */
  const renderGuidePages = (canvas: WorkflowCanvasDefinition) =>
    new Promise<HTMLElement[]>((resolve) => {
      const document = guideSource ? buildGuide(canvas, t, guideSource) : null;
      if (!document) {
        resolve([]);
        return;
      }
      guideResolver.current = resolve;
      setGuide({ units: flattenGuide(document), headerTitle: document.title });
    });

  const handleExport = async (format: "png" | "pdf") => {
    const container = captureElement.current;
    if (!container) return;
    const canvas = canvases[activeId];
    const fileBaseName = buildWorkflowFileName(activeId, new Date());

    setExporting(true);
    try {
      await waitForPaint();
      const bounds = canvasBounds(canvas, {
        withHeading: true,
        showRead: Boolean(showReadById[activeId]),
      });
      if (format === "png") {
        await exportPng(container, bounds, fileBaseName);
      } else {
        const guidePages = await renderGuidePages(canvas);
        await exportPdf(container, bounds, fileBaseName, guidePages);
      }
    } finally {
      guideResolver.current = null;
      setGuide(null);
      setExporting(false);
    }
  };

  const busy = exporting || capturing;

  return (
    <>
      <V2StandardDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        icon={<Network className="h-4 w-4 text-violet-600" />}
        layout="1-column"
        size="xl"
        enableFullscreen
        leftPanel={
          <div className="p-4">
            <WorkflowCanvas
              canvas={canvases[activeId]}
              canvasOptions={canvasOptions}
              onSelectCanvas={handleSelectCanvas}
              showRead={Boolean(showReadById[activeId])}
              onToggleRead={handleToggleRead}
              exportMode={exporting}
              captureRef={setCaptureElement}
              t={t}
            />
          </div>
        }
        actions={[
          {
            label: t("workflow.drawer.exportPng", "Tải PNG"),
            onClick: () => void handleExport("png"),
            variant: "outline",
            loading: busy,
            disabled: busy,
          },
          {
            label: t("workflow.drawer.exportPdf", "Tải PDF"),
            onClick: () => void handleExport("pdf"),
            primary: true,
            loading: busy,
            disabled: busy,
          },
        ]}
      />
      {guide &&
        guideSource &&
        createPortal(
          <WorkflowGuideDocument
            units={guide.units}
            headerTitle={guide.headerTitle}
            pageLabel={t(
              guideSource.pageLabel.key,
              guideSource.pageLabel.fallback,
            )}
            onPagesReady={handleGuidePagesReady}
          />,
          document.body,
        )}
    </>
  );
}
