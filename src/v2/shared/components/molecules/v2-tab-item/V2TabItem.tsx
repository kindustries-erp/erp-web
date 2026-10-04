import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
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
        "v2-tab-item group relative flex h-8 min-h-[32px] items-center gap-1.5 px-3 border-r border-border text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap select-none",
        isActive
          ? "bg-card text-foreground font-semibold border-b-2 border-b-primary shadow-xs"
          : "bg-surface/50 text-muted-fg hover:bg-surface-hover hover:text-foreground",
        className,
      )}
      {...props}
    >
      {Icon && (
        <Icon
          size={13}
          className={cn(
            "flex-shrink-0 transition-opacity",
            isActive
              ? "opacity-100 text-foreground"
              : "opacity-60 group-hover:opacity-100",
          )}
          aria-hidden="true"
        />
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
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={closeTabAria}
          title={closeTabAria}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="ml-1 flex h-4 w-4 min-w-[16px] items-center justify-center rounded-full text-faint hover:bg-accent hover:text-foreground border-none bg-transparent p-0 cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <X size={10} strokeWidth={2.5} />
        </V2Button>
      )}
    </div>
  );
};
