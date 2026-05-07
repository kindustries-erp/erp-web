import { Skeleton } from "@/shared/components/Skeleton";

/**
 * ChartSkeleton — Atom: loading placeholder cho biểu đồ đường (LineChart).
 */
export function ChartSkeleton() {
  return (
    <div className="absolute inset-0 flex flex-col justify-end gap-3 px-1 pb-2">
      <Skeleton className="h-3 w-full opacity-60" />
      <Skeleton className="h-3 w-full opacity-60" />
      <Skeleton className="h-3 w-full opacity-60" />
      <Skeleton className="h-3 w-full opacity-60" />
      <Skeleton className="h-3 w-full opacity-60" />
      <div className="flex items-end gap-6 h-[70px] pt-2">
        {["h-7", "h-11", "h-9", "h-16", "h-12", "h-[70px]"].map((cls, i) => (
          <Skeleton key={i} className={`w-10 ${cls}`} />
        ))}
      </div>
    </div>
  );
}
