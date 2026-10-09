import * as React from "react";
import type { V2ColumnToggleItem } from "@/v2/shared/components/molecules/v2-column-toggle";
import { useV2ToolbarPortal } from "@/v2/shared/components/molecules/v2-tab-panel";
import { useV2TableFullscreen } from "./V2StandardTable.fullscreen.hook";
import type { useV2ColumnPreferences } from "./V2StandardTable.preferences.hook";
import type { V2Column, V2TableToolbarConfig } from "./V2StandardTable.type";

type Prefs = ReturnType<typeof useV2ColumnPreferences>;

/** Props dùng chung cho `V2TableToolbar` bản desktop: cột, fullscreen, slot header */
export function useV2DesktopToolbar<T>(
  prefs: Prefs,
  columnsByKey: Map<string, V2Column<T>>,
  config: V2TableToolbarConfig | undefined,
  clearSelection: () => void,
) {
  const slot = useV2ToolbarPortal();
  const fullscreen = useV2TableFullscreen();

  const toggleItems = React.useMemo<V2ColumnToggleItem[]>(
    () =>
      prefs.orderedKeys.flatMap((key) => {
        const column = columnsByKey.get(key);
        return column
          ? [
              {
                key,
                label: column.label,
                visible: prefs.isVisible(key),
                canHide: column.enableHiding !== false,
              },
            ]
          : [];
      }),
    [prefs, columnsByKey],
  );

  return {
    isFullscreen: fullscreen.isFullscreen,
    toolbarProps: {
      config,
      portalTarget: fullscreen.isFullscreen ? null : slot,
      onClearSelection: clearSelection,
      isFullscreen: fullscreen.isFullscreen,
      onToggleFullscreen:
        config?.enableFullscreen === false ? undefined : fullscreen.toggle,
      columnToggle: {
        columns: toggleItems,
        onToggle: prefs.toggleColumn,
        onReorder: prefs.setOrder,
        onReset: prefs.reset,
        isCustomized: prefs.isCustomized,
      },
    },
  };
}
