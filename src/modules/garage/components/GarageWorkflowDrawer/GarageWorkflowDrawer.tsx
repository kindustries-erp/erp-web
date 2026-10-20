import React, { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Network } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ComboboxOption } from "@/shared/components/Combobox";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";

import { canvasBounds } from "./canvasBounds";
import { GarageWorkflowCanvas } from "./GarageWorkflowCanvas";
import {
  GARAGE_WORKFLOW_CANVASES,
  GARAGE_WORKFLOW_CANVAS_ORDER,
} from "./garageWorkflowData";
import type { GarageWorkflowCanvasId } from "./garageWorkflowTypes";
import { buildGuide, flattenGuide } from "./guide/buildGuide";
import type { GuideUnit } from "./guide/guideTypes";
import { WorkflowGuideDocument } from "./guide/WorkflowGuideDocument";
import { buildWorkflowFileName, useWorkflowExport } from "./useWorkflowExport";

export interface GarageWorkflowDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CANVAS_LABEL_FALLBACK: Record<GarageWorkflowCanvasId, string> = {
  "end-user": "Người dùng cuối",
  dev: "Kỹ thuật (Dev)",
};

/** Chờ 2 frame để React vẽ lại canvas (có khối tiêu đề) và xyflow đo lại node. */
function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function GarageWorkflowDrawer({
  open,
  onClose,
}: GarageWorkflowDrawerProps) {
  const { t } = useTranslation("garage");
  const [activeId, setActiveId] = useState<GarageWorkflowCanvasId>(
    GARAGE_WORKFLOW_CANVAS_ORDER[0],
  );
  const [exporting, setExporting] = useState(false);
  const [showReadById, setShowReadById] = useState<
    Record<GarageWorkflowCanvasId, boolean>
  >({
    "end-user": false,
    dev: false,
  });
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

  // Chọn sơ đồ bằng dropdown ngay trên toolbar của canvas (không còn thanh tab của drawer).
  const canvasOptions = useMemo<ComboboxOption[]>(
    () =>
      GARAGE_WORKFLOW_CANVAS_ORDER.map((id) => {
        const canvas = GARAGE_WORKFLOW_CANVASES[id];
        const label = t(
          `workflow.drawer.tab.${id === "end-user" ? "endUser" : "dev"}`,
          CANVAS_LABEL_FALLBACK[id],
        );
        return {
          value: id,
          label,
          tooltipContent: (
            <div className="max-w-xs text-xs leading-snug">
              <div className="font-semibold">
                {t(canvas.title.key, canvas.title.fallback)}
              </div>
              <div>
                {t(canvas.description.key, canvas.description.fallback)}
              </div>
            </div>
          ),
        };
      }),
    [t],
  );

  const handleSelectCanvas = useCallback((value: string) => {
    if (
      GARAGE_WORKFLOW_CANVAS_ORDER.includes(value as GarageWorkflowCanvasId)
    ) {
      setActiveId(value as GarageWorkflowCanvasId);
    }
  }, []);

  const handleToggleRead = useCallback(() => {
    setShowReadById((prev) => ({ ...prev, [activeId]: !prev[activeId] }));
  }, [activeId]);

  const handleGuidePagesReady = useCallback((pages: HTMLElement[]) => {
    guideResolver.current?.(pages);
    guideResolver.current = null;
  }, []);

  /** Dựng tài liệu hướng dẫn ẩn và chờ các trang A4 sẵn sàng để chụp. */
  const renderGuidePages = (
    canvas: (typeof GARAGE_WORKFLOW_CANVASES)[GarageWorkflowCanvasId],
  ) =>
    new Promise<HTMLElement[]>((resolve) => {
      const document = buildGuide(canvas, (key, fallback) => t(key, fallback));
      guideResolver.current = resolve;
      setGuide({ units: flattenGuide(document), headerTitle: document.title });
    });

  const handleExport = async (format: "png" | "pdf") => {
    const container = captureElement.current;
    if (!container) return;
    const canvas = GARAGE_WORKFLOW_CANVASES[activeId];
    const fileBaseName = buildWorkflowFileName(activeId, new Date());

    setExporting(true);
    try {
      await waitForPaint();
      const bounds = canvasBounds(canvas, {
        withHeading: true,
        showRead: showReadById[activeId],
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
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={t("workflow.drawer.title", "Sơ đồ quy trình Garage Hub")}
        subtitle={t(
          "workflow.drawer.subtitle",
          "Hai góc nhìn: vận hành cho người dùng cuối, kiến trúc module cho dev",
        )}
        icon={<Network className="h-4 w-4 text-violet-600" />}
        layout="1-column"
        size="xl"
        enableFullscreen
        leftPanel={
          <div className="p-4">
            <GarageWorkflowCanvas
              canvas={GARAGE_WORKFLOW_CANVASES[activeId]}
              canvasOptions={canvasOptions}
              onSelectCanvas={handleSelectCanvas}
              showRead={showReadById[activeId]}
              onToggleRead={handleToggleRead}
              exportMode={exporting}
              captureRef={setCaptureElement}
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
        createPortal(
          <WorkflowGuideDocument
            units={guide.units}
            headerTitle={guide.headerTitle}
            pageLabel={t("workflow.guide.pageLabel", "Trang")}
            onPagesReady={handleGuidePagesReady}
          />,
          document.body,
        )}
    </>
  );
}
