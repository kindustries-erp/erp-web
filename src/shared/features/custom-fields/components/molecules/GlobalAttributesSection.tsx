import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { AttributeTreeList } from "./AttributeTreeList";
import type { AttributeTreeNode } from "../../domains/types";

export interface GlobalAttributesSectionProps {
  globalTrees: AttributeTreeNode[];
  effectiveGlobalAttributes: Record<string, any>;
  isEditable: boolean;
  moduleKey: string;
  effectiveAttributes: Record<string, any>;
  handleGlobalAttributeChange: (attrDefId: string, value: any) => void;
  activeGlobalDefsCount: number;
  globalTitle?: string;
  globalCollapsible?: boolean;
  globalDefaultCollapsed?: boolean;
  t: (key: string, fallback: string) => string;
}

export function GlobalAttributesSection({
  globalTrees,
  effectiveGlobalAttributes,
  isEditable,
  moduleKey,
  effectiveAttributes,
  handleGlobalAttributeChange,
  activeGlobalDefsCount,
  globalTitle,
  globalCollapsible = true,
  globalDefaultCollapsed = false,
  t,
}: GlobalAttributesSectionProps) {
  const globalSectionTitle =
    globalTitle ||
    t("moduleConfig.globalAttributesSection", "Thuộc tính chung");

  return (
    <DrawerSection
      title={globalSectionTitle}
      collapsible={globalCollapsible}
      defaultCollapsed={globalDefaultCollapsed}
    >
      <div className="space-y-3">
        {activeGlobalDefsCount === 0 ? (
          <div className="p-2.5 text-center text-muted-foreground text-xs bg-muted/20 rounded-lg border border-dashed border-border/50">
            {t(
              "moduleConfig.noGlobalAttributes",
              "Phân hệ này chưa cấu hình thuộc tính chung nào.",
            )}
          </div>
        ) : (
          <AttributeTreeList
            nodes={globalTrees}
            attrsValues={effectiveGlobalAttributes}
            isCategory={false}
            isEditable={isEditable}
            moduleKey={moduleKey}
            allAttributes={{
              ...(effectiveAttributes || {}),
              ...(effectiveGlobalAttributes || {}),
            }}
            onAttributeChange={handleGlobalAttributeChange}
            t={t}
          />
        )}
      </div>
    </DrawerSection>
  );
}
