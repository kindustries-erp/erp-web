import React, { useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Download,
  Printer,
  RefreshCw,
  Copy,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import {
  ActionDropdown,
  type ActionDropdownItem,
  type ActionItem,
} from "@/shared/components/ActionDropdown";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";

export interface TableRowHoverActionsProps {
  items: ActionDropdownItem[];
  className?: string;
  maxQuickActions?: number;
  onMenuOpenChange?: (open: boolean) => void;
  visible?: boolean;
}

export function extractQuickActions(
  items: ActionDropdownItem[],
  maxCount = 2,
): ActionItem[] {
  const result: ActionItem[] = [];

  for (const item of items) {
    if ("items" in item && Array.isArray(item.items)) {
      for (const subItem of item.items) {
        if (!subItem.hidden) {
          result.push(subItem);
          if (result.length >= maxCount) return result;
        }
      }
    } else if (!("items" in item) && !item.hidden) {
      result.push(item);
      if (result.length >= maxCount) return result;
    }
  }

  return result;
}

export function resolveActionIcon(action: ActionItem): React.ReactNode {
  if (action.icon) {
    return React.isValidElement(action.icon)
      ? React.cloneElement(action.icon as React.ReactElement, {
          className: cn(
            "w-3.5 h-3.5 flex-shrink-0",
            (action.icon.props as any)?.className,
          ),
        })
      : action.icon;
  }

  const label = (action.label || "").toLowerCase();

  if (
    label.includes("chi tiết") ||
    label.includes("xem") ||
    label.includes("view") ||
    label.includes("detail")
  ) {
    return <Eye className="w-3.5 h-3.5 flex-shrink-0" />;
  }
  if (
    label.includes("sửa") ||
    label.includes("chỉnh") ||
    label.includes("edit") ||
    label.includes("cập nhật")
  ) {
    return <Pencil className="w-3.5 h-3.5 flex-shrink-0" />;
  }
  if (
    label.includes("xóa") ||
    label.includes("delete") ||
    label.includes("remove") ||
    label.includes("hủy")
  ) {
    return <Trash2 className="w-3.5 h-3.5 flex-shrink-0 text-destructive" />;
  }
  if (
    label.includes("tải") ||
    label.includes("download") ||
    label.includes("xuất") ||
    label.includes("export")
  ) {
    return <Download className="w-3.5 h-3.5 flex-shrink-0" />;
  }
  if (label.includes("in") || label.includes("print")) {
    return <Printer className="w-3.5 h-3.5 flex-shrink-0" />;
  }
  if (
    label.includes("đồng bộ") ||
    label.includes("sync") ||
    label.includes("làm mới") ||
    label.includes("refresh")
  ) {
    return <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />;
  }
  if (
    label.includes("sao chép") ||
    label.includes("copy") ||
    label.includes("nhân bản")
  ) {
    return <Copy className="w-3.5 h-3.5 flex-shrink-0" />;
  }

  return <MoreHorizontal className="w-3.5 h-3.5 flex-shrink-0" />;
}

export function TableRowHoverActions({
  items,
  className,
  maxQuickActions = 2,
  onMenuOpenChange,
}: TableRowHoverActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuOpenChange = (open: boolean) => {
    setIsMenuOpen(open);
    onMenuOpenChange?.(open);
  };

  if (!items || items.length === 0) return null;

  const quickActions = extractQuickActions(items, maxQuickActions);

  return (
    <div
      className={cn(
        "flex items-center justify-end transition-all duration-150 select-none",
        isMenuOpen
          ? "opacity-100 pointer-events-auto translate-x-0"
          : "opacity-0 pointer-events-none translate-x-1 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover/row:opacity-100 group-hover/row:pointer-events-auto group-hover/row:translate-x-0",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background: "var(--popup-bg, rgba(246, 248, 252, 0.78))",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
        className="inline-flex items-center gap-1 p-1 rounded-xl border border-[color:var(--popup-border)] shadow-[0_8px_24px_-4px_rgba(15,23,42,0.16),0_2px_6px_rgba(15,23,42,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset]"
      >
        {/* Quick action buttons */}
        {quickActions.map((action, index) => {
          const isDanger = action.variant === "danger";
          const icon = resolveActionIcon(action);

          return (
            <Tooltip key={index} content={action.label}>
              <button
                type="button"
                disabled={action.disabled || action.loading}
                aria-label={action.label}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!action.disabled && !action.loading) {
                    action.onClick();
                  }
                }}
                className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-lg transition-colors text-muted-foreground",
                  !action.disabled &&
                    !isDanger &&
                    "hover:bg-muted hover:text-foreground active:bg-muted/80",
                  !action.disabled &&
                    isDanger &&
                    "text-destructive/80 hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20",
                  action.disabled && "opacity-40 cursor-not-allowed",
                  action.loading && "cursor-wait",
                )}
              >
                {action.loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                ) : (
                  icon
                )}
              </button>
            </Tooltip>
          );
        })}

        {/* Full action dropdown menu */}
        <ActionDropdown
          items={items}
          align="end"
          open={isMenuOpen}
          onOpenChange={handleMenuOpenChange}
          customTrigger={
            <button
              type="button"
              title="Thao tác khác"
              aria-label="Thao tác khác"
              className={cn(
                "inline-flex items-center justify-center w-6 h-6 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                isMenuOpen && "bg-muted text-foreground",
              )}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          }
        />
      </div>
    </div>
  );
}
