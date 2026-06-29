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

export function ChartSkeleton({ type = "bar" }: { type?: "bar" | "donut" }) {
  if (type === "donut") {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-[150px] h-[150px] rounded-full border-[20px] border-[color:var(--border)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center w-full h-full gap-4 px-4 pb-4 pt-8">
      {[40, 70, 45, 90, 60, 80].map((height, i) => (
        <div
          key={i}
          className="w-10 rounded-t-sm bg-[color:var(--border)] animate-pulse"
          style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}
