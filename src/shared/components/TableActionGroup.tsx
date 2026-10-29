import React, { useCallback } from "react";
import { RefreshCw, Plus } from "lucide-react";
import {
  V2Button,
  V2ToolbarIconButton,
  V2TableFilterButton,
  V2TableFilterChip,
  V2SplitButton,
} from "@/v2/shared/components";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { setPortalTarget } from "./portalStore";
import { useT } from "@/core/i18n";

interface TableActionGroupProps {
  onRefresh?: () => void;
  loading?: boolean;

  onFilterToggle?: () => void;
  activeFilterCount?: number;
  onClearAllFilters?: () => void;

  onCreate?: () => void;
  createLabel?: string;
  createIcon?: React.ReactNode;
  createActions?: ActionDropdownItem[];

  extraActions?: React.ReactNode;
  children?: React.ReactNode;
  portalId?: string;
}

export function TableActionGroup({
  onRefresh,
  loading,
  onFilterToggle,
  activeFilterCount = 0,
  onClearAllFilters,
  onCreate,
  createLabel = "Tạo mới",
  createIcon,
  createActions,
  extraActions,
  children,
  portalId = "default",
}: TableActionGroupProps) {
  const t = useT();

  const columnRefCallback = useCallback(
    (el: Element | null) => {
      setPortalTarget(`${portalId}-column`, el);
      // Fallback cho legacy portal target
      setPortalTarget(portalId, el);
    },
    [portalId],
  );

  const fullscreenRefCallback = useCallback(
    (el: Element | null) => {
      setPortalTarget(`${portalId}-fullscreen`, el);
    },
    [portalId],
  );

  return (
    <div className="flex items-center gap-2 w-full flex-wrap justify-start sm:justify-end">
      {extraActions}

      {/* 1. Slot Cột (Column Visibility) - Đặt TRƯỚC Thao tác hàng loạt & Bộ lọc */}
      <div
        ref={columnRefCallback}
        className="empty:hidden flex items-center justify-center shrink-0"
      />

      {/* 2. Thao tác hàng loạt (Bulk Actions) / Custom Actions */}
      {children}

      {/* 3. Nút Bộ Lọc (Filter) - Có filter active thì hiện Filter Chip; Chưa có thì hiện Filter Button */}
      {activeFilterCount > 0 && onClearAllFilters ? (
        <V2TableFilterChip
          count={activeFilterCount}
          onClear={onClearAllFilters}
          onToggleFilter={onFilterToggle}
        />
      ) : (
        onFilterToggle && (
          <V2TableFilterButton
            onClick={onFilterToggle}
            activeCount={activeFilterCount}
          />
        )
      )}

      {/* 3. Slot Toàn màn hình (Fullscreen) - Đặt SAU Bộ lọc, TRƯỚC Tải lại */}
      <div
        ref={fullscreenRefCallback}
        className="empty:hidden flex items-center justify-center shrink-0"
      />

      {/* 4. Nút Làm mới (Refresh) - Chuẩn V2 icon button */}
      {onRefresh && (
        <V2ToolbarIconButton
          label={t("Tải lại")}
          icon={
            <RefreshCw
              className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
          }
          disabled={loading}
          onClick={onRefresh}
        />
      )}

      {/* 5. Nút Hành động chính / Tạo mới / Đồng bộ - Chuẩn V2 Split Button */}
      {createActions && createActions.length > 0 ? (
        <V2SplitButton
          label={t(createLabel)}
          icon={createIcon || <Plus className="h-4 w-4 mr-1" />}
          onClick={onCreate}
          renderMenu={(trigger) => (
            <ActionDropdown
              items={createActions}
              align="end"
              customTrigger={trigger}
            />
          )}
        />
      ) : onCreate ? (
        <V2Button
          onClick={onCreate}
          size="sm"
          className="h-8 px-3 shrink-0"
          leftIcon={createIcon || <Plus className="h-4 w-4 mr-1" />}
        >
          {t(createLabel)}
        </V2Button>
      ) : null}
    </div>
  );
}
