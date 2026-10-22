import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2Button,
  V2Icon,
  V2Tooltip,
  Sun,
  Moon,
} from "@/v2/shared/components/atoms";
import { V2ThemeToggleProps } from "./V2ThemeToggle.type";

/**
 * V2ThemeToggle Component
 * Nút chuyển đổi nhanh Dark Mode / Light Mode cho Topbar và Shell Layout.
 */
export const V2ThemeToggle: React.FC<V2ThemeToggleProps> = ({
  isDark = false,
  onToggle,
  size = "xs",
  tooltip,
  className,
  ...props
}) => {
  const { t } = useV2Translation();

  const lightModeLabel = t(
    "v2.theme.switchToLight",
    "Chuyển sang giao diện sáng",
  );
  const darkModeLabel = t("v2.theme.switchToDark", "Chuyển sang giao diện tối");
  const effectiveTooltip = tooltip ?? (isDark ? lightModeLabel : darkModeLabel);

  return (
    <V2Tooltip content={effectiveTooltip}>
      <V2Button
        type="button"
        variant="ghost"
        size={size}
        onClick={onToggle}
        aria-label={effectiveTooltip}
        data-testid="v2-theme-toggle"
        data-theme-state={isDark ? "dark" : "light"}
        className={cn(
          "v2-theme-toggle flex items-center justify-center h-6 w-6 p-0 rounded-md border border-border bg-surface text-muted-fg hover:text-foreground hover:bg-surface-hover hover:border-foreground/20 cursor-pointer select-none transition-all shadow-2xs",
          "dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-zinc-300 dark:hover:bg-white/[0.1] dark:hover:text-white",
          className,
        )}
        {...props}
      >
        <V2Icon
          icon={isDark ? Sun : Moon}
          size={13}
          strokeWidth={1.8}
          className={cn(
            "transition-transform duration-200",
            isDark ? "text-amber-400 rotate-0" : "text-muted-fg -rotate-12",
          )}
          aria-hidden="true"
        />
      </V2Button>
    </V2Tooltip>
  );
};

V2ThemeToggle.displayName = "V2ThemeToggle";
