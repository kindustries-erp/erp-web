import * as React from "react";
import { Network } from "lucide-react";

import { V2Icon } from "@/v2/shared/components/atoms";
import type { V2DropdownItem } from "@/v2/shared/components/molecules/v2-dropdown";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

import "./procurementWorkflow.locale";
import { ProcurementWorkflowDrawer } from "./ProcurementWorkflowDrawer";
import { PROCUREMENT_WORKFLOW_PREFIX } from "./procurementWorkflow.text";

/**
 * Mục menu "Xem sơ đồ quy trình" + drawer của nó, dùng chung cho các trang chuỗi mua.
 * Mục luôn bật (không phụ thuộc quyền tạo); trang nhét `item` vào menu hành động và `drawer` vào overlays.
 */
export function useProcurementWorkflowMenu(
  initialCanvasId: "end-user" | "dev" = "end-user",
) {
  const { t } = useV2Translation();
  const [open, setOpen] = React.useState(false);
  const onClose = React.useCallback(() => setOpen(false), []);

  const item = React.useMemo<V2DropdownItem>(
    () => ({
      key: "view-workflow",
      label: t(
        `${PROCUREMENT_WORKFLOW_PREFIX}.menu.view`,
        "Xem sơ đồ quy trình",
      ),
      icon: <V2Icon icon={Network} size={15} />,
      onClick: () => setOpen(true),
    }),
    [t],
  );

  const actionsLabel = t(
    `${PROCUREMENT_WORKFLOW_PREFIX}.menu.actions`,
    "Thao tác",
  );

  const drawer = (
    <ProcurementWorkflowDrawer
      open={open}
      onClose={onClose}
      initialCanvasId={initialCanvasId}
    />
  );

  return { item, actionsLabel, drawer };
}
