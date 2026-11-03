import React, { useCallback, useMemo } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "../../types/traceability.type";
import type { TraceabilityCanvasActions } from "../../types/traceability.flow.type";
import {
  canOpenTraceNode,
  canUnlinkTraceNode,
  splitLinkedNodes,
} from "../../utils/traceability.access";
import { isManualSettlementNode } from "../../utils/traceability.visual";
import { buildTraceTableColumns } from "./V2TraceTable.columns";
import { V2TraceTableSection } from "./V2TraceTableSection";

export interface V2TraceTableProps extends TraceabilityCanvasActions {
  graph: TraceabilityGraphData;
  allowEdit: boolean;
}

/** Chế độ bảng kê: hai nhóm, trực tiếp (cấp 1) và gián tiếp (cấp 2 trở lên), có dòng tổng */
export function V2TraceTable({
  graph,
  allowEdit,
  onOpenDocument,
  onEditManualSettlement,
  onUnlinkNode,
}: V2TraceTableProps) {
  const { t } = useV2Translation();
  const { direct, transitive } = useMemo(
    () => splitLinkedNodes(graph),
    [graph],
  );

  const openNode = useCallback(
    (node: TraceabilityNode) => {
      if (isManualSettlementNode(node)) onEditManualSettlement?.(node);
      else onOpenDocument?.(node);
    },
    [onOpenDocument, onEditManualSettlement],
  );

  const columns = useMemo(
    () => buildTraceTableColumns({ t, allowEdit, onOpen: openNode }),
    [t, allowEdit, openNode],
  );

  const rowActions = (node: TraceabilityNode): V2RowActionGroup[] => {
    const groups: V2RowActionGroup[] = [];
    if (canOpenTraceNode(node, allowEdit)) {
      groups.push({
        groupLabel: t("v2.traceability.table.group.lookup"),
        items: [
          {
            label: t(
              isManualSettlementNode(node)
                ? "v2.traceability.node.editManual"
                : "v2.traceability.node.openDetail",
            ),
            onClick: () => openNode(node),
          },
        ],
      });
    }
    if (canUnlinkTraceNode(node, allowEdit) && onUnlinkNode) {
      groups.push({
        groupLabel: t("v2.traceability.table.group.action"),
        items: [
          {
            label: t("v2.traceability.node.unlink"),
            variant: "danger",
            onClick: () => onUnlinkNode(node),
          },
        ],
      });
    }
    return groups;
  };

  return (
    <div className="space-y-6">
      <V2TraceTableSection
        tableId="v2-traceability-direct"
        title={t("v2.traceability.table.directTitle")}
        items={direct}
        columns={columns}
        rowActions={rowActions}
        emptyLabel={t("v2.traceability.table.empty")}
      />
      <V2TraceTableSection
        tableId="v2-traceability-transitive"
        title={t("v2.traceability.table.transitiveTitle")}
        items={transitive}
        columns={columns}
        rowActions={rowActions}
        emptyLabel={t("v2.traceability.table.empty")}
      />
    </div>
  );
}
