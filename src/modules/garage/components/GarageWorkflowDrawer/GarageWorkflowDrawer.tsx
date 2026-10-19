import React, { useMemo, useRef, useState } from "react";
import { Network } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import type { DrawerTopTabItem } from "@/shared/components/drawer/DrawerTopTabBar";

import { canvasBounds } from "./canvasBounds";
import { GarageWorkflowCanvas } from "./GarageWorkflowCanvas";
import {
  GARAGE_WORKFLOW_CANVASES,
  GARAGE_WORKFLOW_CANVAS_ORDER,
} from "./garageWorkflowData";
import type { GarageWorkflowCanvasId } from "./garageWorkflowTypes";
import { buildWorkflowFileName, useWorkflowExport } from "./useWorkflowExport";

export interface GarageWorkflowDrawerProps {
  open: boolean;
  onClose: () => void;
}

const TAB_LABEL_FALLBACK: Record<GarageWorkflowCanvasId, string> = {
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
  const [exportingId, setExportingId] = useState<GarageWorkflowCanvasId | null>(
    null,
  );
  const [showReadById, setShowReadById] = useState<
    Record<GarageWorkflowCanvasId, boolean>
  >({
    "end-user": false,
    dev: false,
  });
  const captureRefs = useRef<
    Record<GarageWorkflowCanvasId, HTMLDivElement | null>
  >({
    "end-user": null,
    dev: null,
  });
  const { exporting, exportPng, exportPdf } = useWorkflowExport();

  const tabs = useMemo<DrawerTopTabItem[]>(
    () =>
      GARAGE_WORKFLOW_CANVAS_ORDER.map((id) => ({
        key: id,
        label: t(
          `workflow.drawer.tab.${id === "end-user" ? "endUser" : "dev"}`,
          TAB_LABEL_FALLBACK[id],
        ),
        content: (
          <div className="p-4">
            <GarageWorkflowCanvas
              key={id}
              canvas={GARAGE_WORKFLOW_CANVASES[id]}
              showRead={showReadById[id]}
              onToggleRead={() =>
                setShowReadById((prev) => ({ ...prev, [id]: !prev[id] }))
              }
              exportMode={exportingId === id}
              captureRef={(el: HTMLDivElement | null) => {
                captureRefs.current[id] = el;
              }}
            />
          </div>
        ),
      })),
    [t, exportingId, showReadById],
  );

  const handleExport = async (format: "png" | "pdf") => {
    const container = captureRefs.current[activeId];
    if (!container) return;
    const canvas = GARAGE_WORKFLOW_CANVASES[activeId];
    const fileBaseName = buildWorkflowFileName(activeId, new Date());
    const run = format === "png" ? exportPng : exportPdf;

    setExportingId(activeId);
    try {
      await waitForPaint();
      await run(
        container,
        canvasBounds(canvas, {
          withHeading: true,
          showRead: showReadById[activeId],
        }),
        fileBaseName,
      );
    } finally {
      setExportingId(null);
    }
  };

  return (
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
      tabs={tabs}
      activeTabKey={activeId}
      onTabChange={(key: string) => setActiveId(key as GarageWorkflowCanvasId)}
      actions={[
        {
          label: t("workflow.drawer.exportPng", "Tải PNG"),
          onClick: () => void handleExport("png"),
          variant: "outline",
          loading: exporting,
          disabled: exporting,
        },
        {
          label: t("workflow.drawer.exportPdf", "Tải PDF"),
          onClick: () => void handleExport("pdf"),
          primary: true,
          loading: exporting,
          disabled: exporting,
        },
      ]}
    />
  );
}
