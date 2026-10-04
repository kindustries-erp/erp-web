import React from "react";
import {
  Edit3,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import type { DrawerHeaderProps } from "./DrawerHeader.type";

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  title,
  titleExtra,
  subtitle,
  icon,
  headerExtra,
  onClose,
  onToggleEdit,
  isEditing = false,
  enableFullscreen = false,
  isFullscreen = false,
  onToggleFullscreen,
  collapsibleRightPanel = false,
  isRightPanelCollapsed = false,
  onToggleRightPanel,
  className,
  closeAriaLabel = "Close drawer",
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 sm:px-4 md:px-[18px] py-2.5",
        "border-b border-border/70 bg-[var(--drawer-header-bg,rgba(246,248,252,0.75))] backdrop-blur-md shrink-0 gap-2",
        className,
      )}
    >
      {/* Left: Icon, Title, Badge, Subtitle */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {icon && <div className="text-muted-fg shrink-0">{icon}</div>}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate leading-tight">
              {title}
            </h2>
            {titleExtra}
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-fg truncate mt-0.5 leading-none">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {headerExtra}

        {/* Toggle Edit Button */}
        {onToggleEdit && !isEditing && (
          <button
            type="button"
            onClick={onToggleEdit}
            aria-label="Chuyển sang chế độ chỉnh sửa"
            title="Chỉnh sửa (Edit mode)"
            className="p-1.5 rounded-lg text-muted-fg hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}

        {/* Toggle Right Panel (Desktop only) */}
        {collapsibleRightPanel && onToggleRightPanel && (
          <button
            type="button"
            onClick={onToggleRightPanel}
            aria-label={
              isRightPanelCollapsed
                ? "Mở rộng cột thông tin phải"
                : "Thu gọn cột thông tin phải"
            }
            title={
              isRightPanelCollapsed ? "Mở rộng cột phải" : "Thu gọn cột phải"
            }
            className="hidden lg:inline-flex p-1.5 rounded-lg text-muted-fg hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
          >
            {isRightPanelCollapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Fullscreen Button (Desktop only) */}
        {enableFullscreen && onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? "Thu nhỏ màn hình" : "Toàn màn hình"}
            title={isFullscreen ? "Thu nhỏ (Esc)" : "Toàn màn hình"}
            className="hidden lg:inline-flex p-1.5 rounded-lg text-muted-fg hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={closeAriaLabel}
          className="p-1.5 rounded-lg text-muted-fg hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
