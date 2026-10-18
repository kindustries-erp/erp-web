import React from "react";
import {
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
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
  closeAriaLabel,
  isScrolledTop = false,
}) => {
  const { t } = useV2Translation();

  const panelAria = isRightPanelCollapsed
    ? t("v2.drawer.expandRightPanel", "Mở rộng cột thông tin phải")
    : t("v2.drawer.collapseRightPanel", "Thu gọn cột thông tin phải");

  const fullscreenAria = isFullscreen
    ? t("v2.drawer.exitFullscreen", "Thu nhỏ màn hình")
    : t("v2.drawer.fullscreen", "Toàn màn hình");

  const editLabel = t("v2.drawer.edit", "Chỉnh sửa");
  const editAria = t("v2.drawer.editMode", "Chuyển sang chế độ chỉnh sửa");

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 sm:px-4 md:px-[18px] py-2.5",
        "border-b border-border/70 backdrop-blur-md shrink-0 gap-2 transition-shadow duration-200",
        isScrolledTop
          ? "shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08),0_2px_4px_-2px_rgba(15,23,42,0.04)] bg-[var(--drawer-header-scrolled-bg,rgba(246,248,252,0.92))]"
          : "shadow-none bg-[var(--drawer-header-bg,rgba(246,248,252,0.75))]",
        className,
      )}
    >
      {/* Left: Icon, Title, Badge, Subtitle */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {icon && <div className="text-muted-fg shrink-0">{icon}</div>}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <V2Text
              as={typeof title === "string" ? "span" : "div"}
              variant="drawer-title"
              className="truncate leading-tight font-semibold"
            >
              {title}
            </V2Text>
            {titleExtra}
          </div>
          {subtitle && (
            <V2Text
              as={typeof subtitle === "string" ? "span" : "div"}
              variant="drawer-subtitle"
              className="mt-0.5 leading-none block"
            >
              {subtitle}
            </V2Text>
          )}
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {headerExtra}

        {/* Toggle Edit Button */}
        {onToggleEdit && !isEditing && (
          <V2Button
            type="button"
            variant="drawer-edit"
            onClick={onToggleEdit}
            aria-label={editAria}
            title={editAria}
            className="hidden sm:inline-flex"
          >
            {editLabel}
          </V2Button>
        )}

        {/* Divider bar */}
        {onToggleEdit && !isEditing && (
          <div
            data-testid="v2-drawer-header-divider"
            className="h-4 w-px bg-border/70 mx-1 hidden sm:block shrink-0"
            aria-hidden="true"
          />
        )}

        {/* Toggle Right Panel (Desktop only) */}
        {collapsibleRightPanel && onToggleRightPanel && (
          <V2Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onToggleRightPanel}
            aria-label={panelAria}
            title={panelAria}
            className="hidden lg:inline-flex text-muted-fg hover:text-foreground cursor-pointer"
          >
            {isRightPanelCollapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </V2Button>
        )}

        {/* Fullscreen Button (Desktop only) */}
        {enableFullscreen && onToggleFullscreen && (
          <V2Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onToggleFullscreen}
            aria-label={fullscreenAria}
            title={fullscreenAria}
            className="hidden lg:inline-flex text-muted-fg hover:text-foreground cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </V2Button>
        )}

        {/* Close Button */}
        <V2Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label={closeAriaLabel || t("v2.drawer.closeDrawer", "Đóng")}
          className="text-muted-fg hover:text-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </V2Button>
      </div>
    </div>
  );
};
