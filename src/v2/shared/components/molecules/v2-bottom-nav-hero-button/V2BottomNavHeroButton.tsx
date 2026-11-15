import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import {
  V2Button,
  V2Text,
  V2Badge,
  V2BadgeVariant,
  V2NavIcon,
} from "@/v2/shared/components/atoms";
import {
  V2BottomNavHeroButtonProps,
  V2HeroButtonSize,
} from "./V2BottomNavHeroButton.type";

const sizeClasses: Record<V2HeroButtonSize, string> = {
  [V2HeroButtonSize.SM]: "h-9 w-9",
  [V2HeroButtonSize.MD]: "h-10 w-10",
  [V2HeroButtonSize.DEFAULT]: "h-11 w-11",
  [V2HeroButtonSize.LG]: "h-[52px] w-[52px]",
};

const iconSizes: Record<V2HeroButtonSize, number> = {
  [V2HeroButtonSize.SM]: 18,
  [V2HeroButtonSize.MD]: 20,
  [V2HeroButtonSize.DEFAULT]: 22,
  [V2HeroButtonSize.LG]: 24,
};

const translateClasses: Record<V2HeroButtonSize, string> = {
  [V2HeroButtonSize.SM]: "-translate-y-2",
  [V2HeroButtonSize.MD]: "-translate-y-2.5",
  [V2HeroButtonSize.DEFAULT]: "-translate-y-3",
  [V2HeroButtonSize.LG]: "-translate-y-3.5",
};

export const V2BottomNavHeroButton: React.FC<V2BottomNavHeroButtonProps> = ({
  label,
  icon,
  badgeCount,
  isActive = false,
  size = V2HeroButtonSize.DEFAULT,
  onClick,
  className,
  ...props
}) => {
  const normalizedSize =
    (size as V2HeroButtonSize) in sizeClasses
      ? (size as V2HeroButtonSize)
      : V2HeroButtonSize.DEFAULT;

  const resolvedSizeClass = sizeClasses[normalizedSize];
  const resolvedIconSize = iconSizes[normalizedSize];
  const resolvedTranslateClass = translateClasses[normalizedSize];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center shrink-0 z-20",
        resolvedTranslateClass,
      )}
    >
      <V2Button
        type="button"
        variant="default"
        onClick={onClick}
        aria-label={label}
        data-testid="bottom-nav-hero-button"
        className={cn(
          "relative flex items-center justify-center rounded-full bg-primary text-primary-fg shadow-xl shadow-black/20 dark:shadow-black/70 transition-all duration-200 active:scale-90 hover:scale-105 touch-manipulation [-webkit-tap-highlight-color:transparent] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 select-none border-[3px] border-background cursor-pointer p-0",
          resolvedSizeClass,
          isActive &&
            "ring-2 ring-primary ring-offset-2 ring-offset-background",
          className,
        )}
        {...props}
      >
        <V2NavIcon
          icon={icon}
          isActive={isActive}
          size={resolvedIconSize}
          className="text-primary-fg"
        />
        <V2Text as="span" className="sr-only">
          {label}
        </V2Text>
        {typeof badgeCount === "number" && badgeCount > 0 && (
          <V2Badge
            variant={V2BadgeVariant.DESTRUCTIVE}
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold shadow-xs border-0"
          >
            {badgeCount > 99 ? "99+" : badgeCount}
          </V2Badge>
        )}
      </V2Button>
    </div>
  );
};

V2BottomNavHeroButton.displayName = "V2BottomNavHeroButton";
