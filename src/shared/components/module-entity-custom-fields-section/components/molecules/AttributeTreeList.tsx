import type { AttributeTreeNode } from "../../domains/types";
import { AttributeFieldRenderer } from "./AttributeFieldRenderer";

interface AttributeTreeListProps {
  nodes: AttributeTreeNode[];
  attrsValues: Record<string, any>;
  isCategory: boolean;
  isEditable: boolean;
  moduleKey: string;
  categoryCode?: string;
  allAttributes: Record<string, any>;
  onAttributeChange: (attrDefId: string, value: any) => void;
  t: (key: string, fallback: string) => string;
}

export function AttributeTreeList({
  nodes,
  attrsValues,
  isCategory,
  isEditable,
  moduleKey,
  categoryCode,
  allAttributes,
  onAttributeChange,
  t,
}: AttributeTreeListProps) {
  return (
    <>
      {nodes.map((node) => {
        const isRoot = !node.parentDef;
        return (
          <div key={node.def.id} className="space-y-2">
            <AttributeFieldRenderer
              attr={node.def}
              value={attrsValues[node.def.id]}
              isEditable={isEditable}
              moduleKey={moduleKey}
              categoryCode={isCategory ? categoryCode : undefined}
              allAttributes={allAttributes}
              onChange={(v) => onAttributeChange(node.def.id, v)}
              t={t}
              isChild={!isRoot}
              parentDef={node.parentDef}
            />
            {node.children && node.children.length > 0 && (
              <div className="space-y-2">
                <AttributeTreeList
                  nodes={node.children}
                  attrsValues={attrsValues}
                  isCategory={isCategory}
                  isEditable={isEditable}
                  moduleKey={moduleKey}
                  categoryCode={categoryCode}
                  allAttributes={allAttributes}
                  onAttributeChange={onAttributeChange}
                  t={t}
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
