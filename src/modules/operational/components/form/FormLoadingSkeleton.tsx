import { Skeleton } from "@/shared/components/Skeleton";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { useT } from "@/core/i18n";

/**
 * Skeleton layout hiển thị khi Drawer đang loading.
 */
export function FormLoadingSkeleton({
  layout = "2-columns",
}: {
  layout?: "1-column" | "2-columns";
}) {
  const t = useT();

  if (layout === "1-column") {
    return (
      <div className="flex flex-col gap-4 w-full">
        <DrawerSection title={t("Chi tiết")}>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </DrawerSection>
      </div>
    );
  }

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
      <div className="w-full xl:w-[320px] 2xl:w-[360px] shrink-0 order-1 xl:order-2 space-y-4">
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
