import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { V2WorkflowDrawer } from "@/v2/core/workflow";

import { GARAGE_GUIDE } from "./garageGuideSource";
import {
  GARAGE_WORKFLOW_CANVAS_ORDER,
  GARAGE_WORKFLOW_CANVASES,
} from "./garageWorkflowData";

export interface GarageWorkflowDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Drawer sơ đồ quy trình Garage Hub (V1). Engine canvas dùng chung nằm ở
 * `v2/shared/components/organisms/v2-workflow-canvas`; file này chỉ nạp dữ liệu và chữ của garage.
 */
export function GarageWorkflowDrawer({
  open,
  onClose,
}: GarageWorkflowDrawerProps) {
  const { t } = useTranslation("garage");
  const translate = useCallback(
    (key: string, fallback: string) => t(key, fallback),
    [t],
  );
  const canvasLabels = useMemo(
    () => ({
      "end-user": t("workflow.drawer.tab.endUser", "Người dùng cuối"),
      dev: t("workflow.drawer.tab.dev", "Kỹ thuật (Dev)"),
    }),
    [t],
  );

  return (
    <V2WorkflowDrawer
      open={open}
      onClose={onClose}
      canvases={GARAGE_WORKFLOW_CANVASES}
      order={GARAGE_WORKFLOW_CANVAS_ORDER}
      title={t("workflow.drawer.title", "Sơ đồ quy trình Garage Hub")}
      subtitle={t(
        "workflow.drawer.subtitle",
        "Hai góc nhìn: vận hành cho người dùng cuối, kiến trúc module cho dev",
      )}
      canvasLabels={canvasLabels}
      t={translate}
      guide={GARAGE_GUIDE}
    />
  );
}
