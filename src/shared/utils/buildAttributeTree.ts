import type { ModuleAttributeDef } from "@/core/api/moduleConfigApi";
import type { AttributeTreeNode } from "../types/customFields";

export function buildAttributeTree(
  defs: ModuleAttributeDef[],
): AttributeTreeNode[] {
  const defMap = new Map<string, ModuleAttributeDef>();
  defs.forEach((d) => defMap.set(d.code, d));

  const childMap = new Map<string, ModuleAttributeDef[]>();
  const rootDefs: ModuleAttributeDef[] = [];

  defs.forEach((d) => {
    if (
      d.parentAttrCode &&
      defMap.has(d.parentAttrCode) &&
      d.parentAttrCode !== d.code
    ) {
      const list = childMap.get(d.parentAttrCode) || [];
      list.push(d);
      childMap.set(d.parentAttrCode, list);
    } else {
      rootDefs.push(d);
    }
  });

  const buildNode = (
    def: ModuleAttributeDef,
    parentDef?: ModuleAttributeDef,
  ): AttributeTreeNode => {
    const rawChildren = childMap.get(def.code) || [];
    return {
      def,
      parentDef,
      children: rawChildren.map((child) => buildNode(child, def)),
    };
  };

  return rootDefs.map((root) => buildNode(root));
}
