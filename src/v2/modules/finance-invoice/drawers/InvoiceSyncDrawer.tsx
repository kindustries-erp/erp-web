import "../financeInvoiceSync.locale";
import * as React from "react";
import { RefreshCw } from "@/v2/shared/components/atoms";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2SyncProgress } from "@/v2/shared/components/molecules/v2-sync-progress";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { InvoiceSyncConditions } from "./InvoiceSyncConditions";
import {
  GDT_QUERY_WINDOW_DAYS,
  estimateWindowCount,
} from "./InvoiceSyncDrawer.helper";
import type { InvoiceSyncDrawerProps } from "./InvoiceSyncDrawer.type";

/**
 * Drawer đồng bộ hóa đơn (v2), bố cục 2 cột giống drawer xuất Excel.
 * Cột trái: tiến độ và kết quả (GDT) hoặc luồng file XML. Cột phải: điều kiện và nút thao tác.
 */
export const InvoiceSyncDrawer: React.FC<InvoiceSyncDrawerProps> = ({
  open,
  onClose,
  confirmOnClose,
  direction,
  onDirectionChange,
  method,
  onMethodChange,
  period,
  canEditInvoice,
  noCredential,
  syncing,
  onOpenLogin,
  onSync,
  progress,
  gdtResult,
  xmlPanel,
  actions,
}) => {
  const { t } = useV2Translation();
  const isXml = method === "XML";

  const leftPanel = isXml ? (
    <DrawerSection
      title={t("v2.financeInvoiceSync.xml.title", "Tải file XML")}
      fillHeight
    >
      {xmlPanel}
    </DrawerSection>
  ) : (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <DrawerSection
        title={t("v2.financeInvoiceSync.progress.title", "Tiến độ")}
        fillHeight
      >
        <V2SyncProgress
          status={progress.status}
          progress={progress.progress}
          currentItem={progress.currentItem}
          logs={progress.logs}
          fillHeight
          labels={{
            empty: t(
              "v2.financeInvoiceSync.progress.empty",
              "Chưa có tiến trình",
            ),
            running: t(
              "v2.financeInvoiceSync.progress.running",
              "Đang đồng bộ",
            ),
            done: t("v2.financeInvoiceSync.progress.done", "Hoàn tất"),
            error: t("v2.financeInvoiceSync.progress.error", "Có lỗi"),
            currentItem: t(
              "v2.financeInvoiceSync.progress.currentItem",
              "Đang xử lý",
            ),
          }}
        />
      </DrawerSection>
      {gdtResult && (
        <DrawerSection
          title={t("v2.financeInvoiceSync.result.title", "Kết quả")}
        >
          {gdtResult}
        </DrawerSection>
      )}
    </div>
  );

  return (
    <V2StandardDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("v2.financeInvoiceSync.title", "Đồng bộ hóa đơn")}
      icon={<RefreshCw className="h-5 w-5" />}
      size="lg"
      layout="2-columns"
      fillHeight
      actions={actions}
      confirmOnClose={confirmOnClose}
      leftPanel={leftPanel}
      rightPanel={
        <InvoiceSyncConditions
          direction={direction}
          onDirectionChange={onDirectionChange}
          method={method}
          onMethodChange={onMethodChange}
          period={period}
          canEditInvoice={canEditInvoice}
          noCredential={noCredential}
          syncing={syncing}
          onOpenLogin={onOpenLogin}
          onSync={onSync}
          estimatedRuns={estimateWindowCount(period.dateFrom, period.dateTo)}
          windowDays={GDT_QUERY_WINDOW_DAYS}
        />
      }
    />
  );
};
