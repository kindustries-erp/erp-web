import { Skeleton } from "@/shared/components/Skeleton";

/**
 * DonutSkeleton — Atom: loading placeholder cho biểu đồ donut.
 */
export function DonutSkeleton() {
  return (
    <>
      <div className="relative h-[130px] flex items-center justify-center">
        <Skeleton className="h-[112px] w-[112px] rounded-full" />
        <div className="absolute h-[70px] w-[70px] rounded-full bg-surface" />
      </div>
      <div className="mt-[10px] flex flex-col gap-[6px]">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-[55%]" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-[42%]" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </>
  );
}
