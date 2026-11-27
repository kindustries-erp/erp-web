import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Text, V2Icon, X } from "@/v2/shared/components/atoms";
import { V2TabItemProps } from "./V2TabItem.type";

export const V2TabItem: React.FC<V2TabItemProps> = ({
  id,
  label,
  icon: Icon,
  isActive = false,
  isClosable = true,
  showIconOnActiveOnly = true,
  isDragging = false,
  onClick,
  onClose,
  className,
  ...props
}) => {
  const { t } = useV2Translation();
  const closeTabAria = t("v2.tabBar.closeTab", {
    name: label,
    defaultValue: `Đóng tab ${label}`,
  });

  const shouldRenderIcon = Boolean(Icon && (!showIconOnActiveOnly || isActive));

  return (
    <div
      role="tab"
      aria-selected={isActive}
      data-active={isActive ? "true" : "false"}
      data-testid={`v2-tab-item-${id}`}
      onClick={onClick}
      className={cn(
        "v2-tab-item group relative flex h-6 items-center gap-1.5 px-2.5 rounded-md text-[11px] font-medium cursor-pointer transition-all duration-150 ease-out whitespace-nowrap select-none",
        isActive
          ? "bg-slate-900 text-white shadow-xs border border-transparent dark:bg-[color:var(--sidebar-active-bg,rgba(20,184,166,0.15))] dark:text-[color:var(--sidebar-active-fg,#2dd4bf)] dark:border-teal-500/35 dark:shadow-[0_2px_10px_rgba(20,184,166,0.18)] font-semibold"
          : "text-muted-fg dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/[0.05] border border-transparent",
        isDragging &&
          "opacity-50 scale-[1.02] shadow-md z-30 ring-1 ring-primary/20",
        className,
      )}
      {...props}
    >
      {Icon && (
        <span
          data-testid="v2-tab-item-icon"
          className={cn(
            "flex-shrink-0 inline-flex items-center justify-center transition-all duration-150 ease-out",
            showIconOnActiveOnly
              ? isActive
                ? "w-3.5 h-3.5 opacity-100 text-inherit"
                : "w-0 h-0 opacity-0 overflow-hidden"
              : isActive
                ? "w-3.5 h-3.5 opacity-100 text-inherit"
                : "w-3.5 h-3.5 opacity-60 text-inherit group-hover:opacity-100",
          )}
          aria-hidden="true"
        >
          {shouldRenderIcon &&
            (React.isValidElement(Icon) ? (
              Icon
            ) : (
              <V2Icon icon={Icon as any} size={14} />
            ))}
        </span>
      )}
      <V2Text
        as="span"
        variant="body-sm"
        truncate
        className="max-w-[130px] leading-none text-inherit text-[11px]"
      >
        {label}
      </V2Text>
      {isClosable && (
        <V2Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-4 p-0 rounded-md transition-all duration-150 ease-out flex items-center justify-center shrink-0",
            // Bình thường: thu gọn hoàn toàn để không chiếm layout width, lề 2 bên cân đối px-3
            "w-0 ml-0 opacity-0 overflow-hidden scale-75 pointer-events-none",
            // Khi hover tab: mở rộng mượt mà để hiển thị nút x
            "group-hover:w-4 group-hover:ml-1 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto",
            isActive
              ? "hover:bg-white/20 dark:hover:bg-teal-500/25 text-inherit"
              : "hover:bg-black/10 dark:hover:bg-white/10 text-inherit",
          )}
          aria-label={closeTabAria}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        >
          <V2Icon icon={X} size={12} aria-hidden="true" />
        </V2Button>
      )}
    </div>
  );
};
V2TabItem.displayName = "V2TabItem";
