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

  return (
    <div
      role="tab"
      aria-selected={isActive}
      data-testid={`v2-tab-item-${id}`}
      onClick={onClick}
      className={cn(
        "v2-tab-item group relative flex h-full items-center gap-[6px] px-[14px] text-[11px] font-medium cursor-pointer transition-all duration-150 ease-out whitespace-nowrap select-none border-b-2 border-transparent",
        isActive
          ? "text-foreground dark:text-white font-semibold border-b-primary dark:border-b-white"
          : "text-muted-fg dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-100 hover:border-b-black/10 dark:hover:border-b-white/20",
        className,
      )}
      {...props}
    >
      {Icon && (
        <span
          className={cn(
            "flex-shrink-0 inline-flex items-center justify-center transition-opacity",
            isActive
              ? "opacity-100 text-foreground dark:text-white"
              : "opacity-60 dark:opacity-75 group-hover:opacity-100 dark:group-hover:text-white",
          )}
          aria-hidden="true"
        >
          {React.isValidElement(Icon) ? (
            Icon
          ) : (
            <V2Icon icon={Icon as any} size={14} />
          )}
        </span>
      )}
      <V2Text
        as="span"
        variant="body-sm"
        truncate
        className="max-w-[130px] text-inherit"
      >
        {label}
      </V2Text>
      {isClosable && (
        <V2Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 ml-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity flex items-center justify-center"
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
