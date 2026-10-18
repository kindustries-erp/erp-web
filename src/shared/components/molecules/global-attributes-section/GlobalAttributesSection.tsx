import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import type { AttributeTreeNode } from "@/shared/types/customFields";
import { AttributeTreeList } from "../attribute-tree-list";

export interface GlobalAttributesSectionProps {
  title: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  globalTrees: AttributeTreeNode[];
  editMode: boolean;
  moduleKey: string;
  effectiveGlobalAttributes: Record<string, any>;
  onGlobalAttributeChange: (id: string, val: any) => void;
  t: (key: string, fallback: string) => string;
}

export function GlobalAttributesSection({
  title,
  collapsible,
  defaultCollapsed,
  globalTrees,
  editMode,
  moduleKey,
  effectiveGlobalAttributes,
  onGlobalAttributeChange,
  t,
}: GlobalAttributesSectionProps) {
  if (globalTrees.length === 0) return null;

  return (
    <DrawerSection
      title={title}
      collapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
    >
      <AttributeTreeList
        nodes={globalTrees}
        editMode={editMode}
        moduleKey={moduleKey}
        attributes={effectiveGlobalAttributes}
        onChange={onGlobalAttributeChange}
        t={t}
      />
    </DrawerSection>
  );
}
