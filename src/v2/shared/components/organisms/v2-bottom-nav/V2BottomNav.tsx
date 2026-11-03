import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import {
  V2NavItem,
  V2NavIndicator,
} from "@/v2/shared/components/molecules/v2-nav-item";
import { V2BottomNavHeroButton } from "@/v2/shared/components/molecules/v2-bottom-nav-hero-button";
import {
  V2BottomNavItem,
  V2BottomNavProps,
  V2BottomNavVariant,
} from "./V2BottomNav.type";

export const V2BottomNav: React.FC<V2BottomNavProps> = ({
  items = [],
  activeId,
  variant = V2BottomNavVariant.FLOATING,
  indicator = V2NavIndicator.PILL,
  centerHeroItem,
  onNavigate,
  onHeroClick,
  className,
  ...props
}) => {
  const isHeroLayout =
    variant === V2BottomNavVariant.HERO_CENTER || Boolean(centerHeroItem);

  const { leftItems, heroItem, rightItems } = React.useMemo(() => {
    if (!isHeroLayout) {
      return { leftItems: items, heroItem: null, rightItems: [] };
    }
    if (centerHeroItem) {
      const half = Math.ceil(items.length / 2);
      return {
        leftItems: items.slice(0, half),
        heroItem: centerHeroItem,
        rightItems: items.slice(half),
      };
    }
    const mid = Math.floor(items.length / 2);
    return {
      leftItems: items.slice(0, mid),
      heroItem: items[mid],
      rightItems: items.slice(mid + 1),
    };
  }, [items, isHeroLayout, centerHeroItem]);

  const handleHeroClick = (hero: V2BottomNavItem) => {
    if (onHeroClick) {
      onHeroClick(hero);
    } else {
      onNavigate?.(hero);
    }
  };

  const containerClasses = cn(
    "fixed z-40 flex items-center justify-between select-none animate-slide-in-from-bottom transition-all duration-300",
    variant === V2BottomNavVariant.FLOATING || isHeroLayout
      ? "bottom-3 inset-x-3.5 max-w-lg mx-auto h-16 rounded-3xl border border-border/80 dark:border-white/10 bg-card/90 dark:bg-card/95 px-2 shadow-2xl dark:shadow-black/70 backdrop-blur-xl"
      : "bottom-0 inset-x-0 h-16 w-full border-t border-border/80 dark:border-white/10 bg-background/90 dark:bg-card/90 px-1 pb-safe backdrop-blur-xl",
    className,
  );

  return (
    <nav
      data-testid="v2-bottom-nav"
      aria-label="Mobile Navigation"
      className={containerClasses}
      {...props}
    >
      <div className="flex flex-1 items-center justify-around pr-1.5">
        {leftItems.map((item) => (
          <V2NavItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            href={item.href}
            isActive={activeId === item.id}
            badgeCount={item.badgeCount}
            variant="bottom-nav"
            indicator={indicator}
            onClick={() => onNavigate?.(item)}
          />
        ))}
      </div>

      {heroItem && (
        <div className="shrink-0 px-2.5 flex items-center justify-center">
          <V2BottomNavHeroButton
            key={heroItem.id}
            label={heroItem.label}
            icon={heroItem.icon}
            badgeCount={heroItem.badgeCount}
            isActive={activeId === heroItem.id}
            onClick={() => handleHeroClick(heroItem)}
          />
        </div>
      )}

      {rightItems.length > 0 && (
        <div className="flex flex-1 items-center justify-around pl-1.5">
          {rightItems.map((item) => (
            <V2NavItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              href={item.href}
              isActive={activeId === item.id}
              badgeCount={item.badgeCount}
              variant="bottom-nav"
              indicator={indicator}
              onClick={() => onNavigate?.(item)}
            />
          ))}
        </div>
      )}
    </nav>
  );
};
