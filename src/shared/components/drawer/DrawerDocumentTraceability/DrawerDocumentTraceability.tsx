import React from "react";
import { cn } from "@/shared/utils";
import { DrawerSection } from "@/shared/components/DrawerModal";
import type { DrawerDocumentTraceabilityProps } from "./types";
import { openGlobalErpDocument } from "./constants";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
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
    wrapInSection = false,
    sectionTitle,
  } = props;

  const { t } = useV2Translation();

  const content = (
    <div className={cn("w-full transition-all", className)}>
      <V2DocumentTraceability
        rootId={rootId}
        fetchGraph={fetchGraph}
        graphData={graphData}
        editMode={Boolean(editMode ?? allowEdit)}
        allowedDocTypes={allowedDocTypes}
        onAddLink={onAddLink}
        onUnlinkNode={
          onUnlinkNode
            ? (node) => {
                void onUnlinkNode(node);
              }
            : undefined
        }
        onEditManualSettlement={
          onEditManualSettlement
            ? (node) => {
                onEditManualSettlement(node);
              }
            : undefined
        }
        onOpenDocument={(node) => openGlobalErpDocument(node.docType, node.id)}
      />
    </div>
  );

  if (wrapInSection) {
    return (
      <DrawerSection
        title={sectionTitle ?? t("v2.traceability.sectionTitle")}
        collapsible
        defaultCollapsed={false}
        fitViewportHeight
        bodyClassName="flex-1 min-h-0 flex flex-col"
      >
        {content}
      </DrawerSection>
    );
  }

  return content;
}
