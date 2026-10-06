import { useState, useCallback } from "react";

export function useV2Sidebar(
  initialCollapsed = false,
  controlledCollapsed?: boolean,
  onControlledToggle?: () => void,
) {
  const [internalCollapsed, setInternalCollapsed] = useState(initialCollapsed);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleCollapse = useCallback(() => {
    if (onControlledToggle) {
      onControlledToggle();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  }, [onControlledToggle]);

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] !== undefined ? !prev[sectionId] : false,
    }));
  }, []);

  return {
    isCollapsed,
    openSections,
    toggleCollapse,
    toggleSection,
  };
}
