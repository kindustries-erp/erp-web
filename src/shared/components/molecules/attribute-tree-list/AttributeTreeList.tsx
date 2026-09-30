import React from "react";
import type { AttributeTreeNode } from "@/shared/types/customFields";
import { AttributeFieldRenderer } from "../attribute-field-renderer";

export interface AttributeTreeListProps {
  nodes: AttributeTreeNode[];
  editMode: boolean;
  moduleKey: string;
  categoryCode?: string | null;
  attributes: Record<string, any>;
  onChange: (attrDefId: string, value: any) => void;
  t: (key: string, fallback: string) => string;
}

export function AttributeTreeList({
  nodes,
  editMode,
  moduleKey,
  categoryCode,
  attributes,
  onChange,
  t,
}: AttributeTreeListProps) {
  return (
    <div className="space-y-3">
      {nodes.map((node) => {
        const { def, parentDef, children } = node;
        return (
          <div key={def.id} className="space-y-2">
            <AttributeFieldRenderer
              attr={def}
              value={attributes[def.id]}
              isEditable={editMode}
              moduleKey={moduleKey}
              categoryCode={categoryCode}
              allAttributes={attributes}
              onChange={(val) => onChange(def.id, val)}
              t={t}
              isChild={Boolean(parentDef)}
              parentDef={parentDef}
            />

            {children && children.length > 0 && (
              <AttributeTreeList
                nodes={children}
                editMode={editMode}
                moduleKey={moduleKey}
                categoryCode={categoryCode}
                attributes={attributes}
                onChange={onChange}
                t={t}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
