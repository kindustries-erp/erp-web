import { useCallback } from "react";

import { V2WorkflowDrawer } from "@/v2/core/workflow";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

import "./procurementWorkflow.locale";
import {
  PROCUREMENT_WORKFLOW_CANVASES,
  PROCUREMENT_WORKFLOW_ORDER,
} from "./procurementWorkflow.canvases";
import { PROCUREMENT_WORKFLOW_PREFIX } from "./procurementWorkflow.text";

export interface ProcurementWorkflowDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Sơ đồ mở sẵn: trang nghiệp vụ chọn "end-user", trang kho chọn "dev". */
  initialCanvasId?: "end-user" | "dev";
}

/** Drawer "Xem sơ đồ quy trình" của chuỗi mua (PR → PO → GR → sổ tồn). */
export function ProcurementWorkflowDrawer({
  open,
  onClose,
  initialCanvasId,
}: ProcurementWorkflowDrawerProps) {
  const { t: translate } = useV2Translation();

  /** Chữ khung chung của engine (`workflow.*`) nằm ở `v2.workflowCanvas.*`; khóa của sơ đồ đã có tiền tố v2. */
  const t = useCallback(
    (key: string, fallback: string) =>
      translate(
        key.startsWith("workflow.")
          ? `v2.workflowCanvas.${key.slice("workflow.".length)}`
          : key,
        fallback,
      ),
    [translate],
  );

  const p = PROCUREMENT_WORKFLOW_PREFIX;
  return (
    <V2WorkflowDrawer
      open={open}
      onClose={onClose}
      canvases={PROCUREMENT_WORKFLOW_CANVASES}
      order={PROCUREMENT_WORKFLOW_ORDER}
      initialCanvasId={initialCanvasId}
      title={t(`${p}.drawer.title`, "Sơ đồ quy trình mua hàng")}
      subtitle={t(`${p}.drawer.subtitle`, "")}
      canvasLabels={{
        "end-user": t(`${p}.tab.endUser`, "Người dùng cuối"),
        dev: t(`${p}.tab.dev`, "Kỹ thuật (Dev)"),
      }}
      t={t}
    />
  );
}
