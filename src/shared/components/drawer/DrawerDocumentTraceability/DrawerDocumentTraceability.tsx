import React from "react";
import { cn } from "@/shared/utils";
import type { DrawerDocumentTraceabilityProps } from "./types";
import { openGlobalErpDocument } from "./constants";
import { V2DocumentTraceability } from "@/v2/shared/components/organisms/v2-document-traceability";

/**
 * Adapter Facade V1: Tái sử dụng component V2 chuẩn hóa (V2DocumentTraceability)
 * với toàn bộ layout engine mới (gióng hàng Y, khóa kéo rê node, nhãn trên đường kẻ),
 * đảm bảo 100% tương thích ngược với các drawer V1 hiện tại (GarageCaseStandaloneDrawer, InventoryItemFormDrawer, ...).
 */
export function DrawerDocumentTraceability(
  props: DrawerDocumentTraceabilityProps,
) {
  const {
    rootId,
    fetchGraph,
    graphData,
    editMode,
    allowEdit,
    allowedDocTypes,
    onAddLink,
    onUnlinkNode,
    onEditManualSettlement,
    className,
  } = props;

  return (
    <div className={cn("w-full transition-all", className)}>
      <V2DocumentTraceability
        rootId={rootId}
        fetchGraph={fetchGraph as never}
        graphData={graphData as never}
        editMode={Boolean(editMode ?? allowEdit)}
        allowedDocTypes={allowedDocTypes as never}
        onAddLink={onAddLink as never}
        onUnlinkNode={
          onUnlinkNode
            ? (node) => {
                void onUnlinkNode(node as never);
              }
            : undefined
        }
        onEditManualSettlement={
          onEditManualSettlement
            ? (node) => {
                onEditManualSettlement(node as never);
              }
            : undefined
        }
        onOpenDocument={(node) => openGlobalErpDocument(node.docType, node.id)}
      />
    </div>
  );
}
