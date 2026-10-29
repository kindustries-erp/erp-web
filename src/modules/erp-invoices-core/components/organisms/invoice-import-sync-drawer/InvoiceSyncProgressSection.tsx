import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2SyncProgress } from "@/v2/shared/components/molecules/v2-sync-progress";
import { useInvoiceSyncProgressStore } from "@/modules/erp-invoices-core/hooks/useInvoiceSyncProgressStore";

export function InvoiceSyncProgressSection() {
  const { t } = useTranslation("erpInvoices");
  const status = useInvoiceSyncProgressStore((s) => s.status);
  const progress = useInvoiceSyncProgressStore((s) => s.progress);
  const currentItem = useInvoiceSyncProgressStore((s) => s.currentItem);
  const logs = useInvoiceSyncProgressStore((s) => s.logs);

  return (
    <DrawerSection
      title={t("syncProgressTitle", "Tiến trình")}
      fillHeight
      className="flex min-h-[220px] flex-1 flex-col"
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      <V2SyncProgress
        fillHeight
        status={status}
        progress={progress}
        currentItem={currentItem}
        logs={logs}
        labels={{
          empty: t("syncProgressEmpty", "Chưa có tiến trình nào..."),
          running: t("syncProgressRunning", "Đang đồng bộ"),
          currentItem: t("syncProgressCurrentItem", "Đang xử lý"),
          done: t("syncProgressDone", "Hoàn tất"),
          error: t("syncProgressError", "Đồng bộ thất bại"),
        }}
      />
    </DrawerSection>
  );
}
