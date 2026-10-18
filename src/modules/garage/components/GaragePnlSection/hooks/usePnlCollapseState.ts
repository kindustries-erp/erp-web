import { useState, useCallback, useMemo } from "react";

export type PnlSectionKey =
  | "revenue"
  | "cogs"
  | "grossProfit"
  | "selling"
  | "opex"
  | "netProfit"
  | "serviceComm"
  | "retainedProfit";

export const ALL_PNL_SECTIONS: PnlSectionKey[] = [
  "revenue",
  "cogs",
  "grossProfit",
  "selling",
  "opex",
  "netProfit",
  "serviceComm",
  "retainedProfit",
];

export interface UsePnlCollapseStateReturn {
  collapsedMap: Record<PnlSectionKey, boolean>;
  isCollapsed: (key: PnlSectionKey) => boolean;
  toggleSection: (key: PnlSectionKey) => void;
  expandAll: () => void;
  collapseAll: () => void;
  toggleAll: () => void;
  isAllCollapsed: boolean;
  isAnyCollapsed: boolean;
}

export function usePnlCollapseState(
  initialCollapsed: boolean = false,
): UsePnlCollapseStateReturn {
  const [collapsedMap, setCollapsedMap] = useState<
    Record<PnlSectionKey, boolean>
  >(() => {
    const init = {} as Record<PnlSectionKey, boolean>;
    ALL_PNL_SECTIONS.forEach((key) => {
      init[key] = initialCollapsed;
    });
    return init;
  });

  const isCollapsed = useCallback(
    (key: PnlSectionKey) => Boolean(collapsedMap[key]),
    [collapsedMap],
  );

  const toggleSection = useCallback((key: PnlSectionKey) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const expandAll = useCallback(() => {
    const next = {} as Record<PnlSectionKey, boolean>;
    ALL_PNL_SECTIONS.forEach((key) => {
      next[key] = false;
    });
    setCollapsedMap(next);
  }, []);

  const collapseAll = useCallback(() => {
    const next = {} as Record<PnlSectionKey, boolean>;
    ALL_PNL_SECTIONS.forEach((key) => {
      next[key] = true;
    });
    setCollapsedMap(next);
  }, []);

  const isAllCollapsed = useMemo(
    () => ALL_PNL_SECTIONS.every((key) => Boolean(collapsedMap[key])),
    [collapsedMap],
  );

  const isAnyCollapsed = useMemo(
    () => ALL_PNL_SECTIONS.some((key) => Boolean(collapsedMap[key])),
    [collapsedMap],
  );

  const toggleAll = useCallback(() => {
    if (isAllCollapsed) {
      expandAll();
    } else {
      collapseAll();
    }
  }, [isAllCollapsed, expandAll, collapseAll]);

  return {
    collapsedMap,
    isCollapsed,
    toggleSection,
    expandAll,
    collapseAll,
    toggleAll,
    isAllCollapsed,
    isAnyCollapsed,
  };
}
