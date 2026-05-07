import { cn } from "@/shared/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-[color:var(--border)]",
        className,
      )}
    />
  );
}
