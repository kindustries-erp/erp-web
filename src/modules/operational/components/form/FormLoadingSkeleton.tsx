import { Skeleton } from "@/shared/components/Skeleton";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { useT } from "@/core/i18n";

/**
 * Skeleton layout 2 cột hiển thị khi OperationalFormDrawer đang loading.
 * Extracted từ OperationalFormDrawer.tsx (dòng 749–772).
 */
export function FormLoadingSkeleton() {
  const t = useT();
  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start w-full max-w-full">
      <div className="flex-1 min-w-0 w-full order-2 xl:order-1 space-y-4">
        <DrawerSection title={t("Chi tiết")}>
          <div className="space-y-3">
            <Skeleton className="h-[52px] w-full" />
            <Skeleton className="h-[52px] w-full" />
            <Skeleton className="h-[52px] w-full" />
          </div>
        </DrawerSection>
      </div>
      <div className="w-full xl:w-[320px] shrink-0 order-1 xl:order-2 space-y-4">
        <DrawerSection title={t("Thông tin chung")}>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </DrawerSection>
      </div>
    </div>
  );
}
