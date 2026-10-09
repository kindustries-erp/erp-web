import * as React from "react";
import { createPortal } from "react-dom";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2ColumnToggle } from "@/v2/shared/components/molecules/v2-column-toggle";
import type { V2ColumnToggleProps } from "@/v2/shared/components/molecules/v2-column-toggle";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2TableToolbarCluster,
  type V2TableToolbarClusterProps,
} from "./V2StandardTable.toolbar.cluster";
import type { V2TableToolbarConfig } from "./V2StandardTable.type";

interface V2TableToolbarProps {
  activeFilterCount: number;
  onClearAllFilters: () => void;
  selectedCount: number;
  toolbarExtra?: React.ReactNode;
  /** Bỏ trống ở mobile: không có tùy chỉnh cột */
  columnToggle?: V2ColumnToggleProps;
  /** Có config: cụm nút đầy đủ, đưa vào slot header nếu có `portalTarget` */
  config?: V2TableToolbarConfig;
  portalTarget?: HTMLElement | null;
  onClearSelection?: () => void;
  loading?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const V2TableToolbar: React.FC<V2TableToolbarProps> = ({
  activeFilterCount,
  onClearAllFilters,
  selectedCount,
  toolbarExtra,
  columnToggle,
  config,
  portalTarget,
  onClearSelection,
  loading,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const { t } = useV2Translation();

  if (config) {
    const clusterProps: V2TableToolbarClusterProps = {
      config,
      activeFilterCount,
      onClearAllFilters,
      selectedCount,
      onClearSelection: onClearSelection ?? (() => undefined),
      columnToggle,
      loading,
      isFullscreen,
      onToggleFullscreen,
    };
    const cluster = <V2TableToolbarCluster {...clusterProps} />;
    if (portalTarget) {
      return (
        <>
          {createPortal(cluster, portalTarget)}
          {toolbarExtra && (
            <div className="flex min-h-8 items-center gap-2">
              {toolbarExtra}
            </div>
          )}
        </>
      );
    }
    return (
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">{toolbarExtra}</div>
        {cluster}
      </div>
    );
  }

  const statusItems = (
    <>
      {selectedCount > 0 && (
        <V2Text as="span" variant="body-sm" color="muted">
          {t("v2.table.selectedCount", { count: selectedCount })}
        </V2Text>
      )}
      {activeFilterCount > 0 && (
        <V2Button
          variant="destructive-outline"
          size="xs"
          onClick={onClearAllFilters}
        >
          {t("v2.table.clearAllFilters", { count: activeFilterCount })}
        </V2Button>
      )}
    </>
  );

  /** Không có config nhưng có slot header: đưa trạng thái + nút cột lên cùng hàng với header */
  if (portalTarget) {
    return (
      <>
        {createPortal(
          <div className="flex flex-wrap items-center justify-end gap-2">
            {statusItems}
            {columnToggle && <V2ColumnToggle {...columnToggle} />}
          </div>,
          portalTarget,
        )}
        {toolbarExtra && (
          <div className="flex min-h-8 items-center gap-2">{toolbarExtra}</div>
        )}
      </>
    );
  }

  return (
    <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {toolbarExtra}
        {statusItems}
      </div>
      {columnToggle && <V2ColumnToggle {...columnToggle} />}
    </div>
  );
};
