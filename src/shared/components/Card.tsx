import { cn } from "@/shared/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Disable hover lift effect (useful for static display cards) */
  noHover?: boolean;
}

/**
 * Shared Card component — rounded border, surface background, card-shadow with hover lift.
 * Used across drawers, modals, and dashboard for consistent styling.
 */
export function Card({ children, className, noHover }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-3",
        !noHover && "card-shadow",
        noHover &&
          "shadow-[0_1px_4px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  className?: string;
}

/**
 * Card section header — uppercase label with bottom border divider.
 */
export function CardHeader({ title, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "text-[11px] font-bold text-foreground/80 uppercase tracking-[0.06em] mb-[10px] pb-[6px] border-b border-border",
        className,
      )}
    >
      {title}
    </div>
  );
}
