import { useTranslation } from "react-i18next";
import { InvoiceSyncDrawer } from "@/v2/modules/finance-invoice/drawers/InvoiceSyncDrawer";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { InvoiceXmlImportModal as ImportPreviewModal } from "@/modules/erp-invoices-core/components/organisms/invoice-xml-import-modal";
import { InvoiceDetailWrapper } from "@/modules/erp-invoices-core/components/organisms/invoice-detail-wrapper";
import { GdtPortalAuthDrawer } from "@/modules/erp-invoices-core/components/organisms/gdt-portal-auth-drawer";
import { InvoiceGdtSyncResult } from "./InvoiceGdtSyncResult";
import { InvoiceXmlSyncPanel } from "./InvoiceXmlSyncPanel";
import { buildInvoiceSyncActions } from "./invoiceSyncDrawer.actions";
import { useInvoiceImportSyncDrawer } from "./useInvoiceImportSyncDrawer";
import type { InvoiceImportSyncDrawerProps } from "./InvoiceImportSyncDrawer.type";
export type { InvoiceImportSyncDrawerProps };

export function InvoiceImportSyncDrawer({
  open,
  onClose,
  onImported,
  initialDirection,
}: InvoiceImportSyncDrawerProps) {
  const { t } = useTranslation("erpInvoices");
  const s = useInvoiceImportSyncDrawer({
    open,
    onClose,
    onImported,
    initialDirection,
  });

  const actions = buildInvoiceSyncActions({
    method: s.method,
    xmlStep: s.xml.step,
    fileCount: s.xml.files.length,
    createdCount: s.xml.result?.created ?? null,
    bulkXml: {
      loading: s.bulkXmlLoading,
      disabled:
        s.bulkXmlLoading ||
        s.portal.loading ||
        (!s.portal.hasToken && !s.portal.hasPassword),
    },
    labels: {
      bulkXml: t("bulkXml", "Tải lại XML"),
      bulkXmlLoading: t("bulkXmlLoading", "Đang xử lý..."),
      close: t("actionClose", "Đóng"),
      cancel: t("actionCancel", "Hủy"),
      preview: t("importActionPreview", {
        count: s.xml.files.length,
        defaultValue: `Xem trước & Import (${s.xml.files.length} file)`,
      }),
      importMore: t("importActionMore", "Import thêm"),
      viewCreated: t("importActionViewCreated", "Xem hóa đơn vừa tạo"),
    },
    handlers: {
      onClose: s.requestClose,
      onCancel: s.requestClose,
      onPreview: () => s.setShowPreview(true),
      onImportMore: s.xml.handleReset,
      onBulkXml: s.handleBulkXml,
    },
  });

  return (
    <>
      <InvoiceSyncDrawer
        open={open}
        onClose={s.doClose}
        confirmOnClose={s.hasPendingXml}
        direction={s.direction}
        onDirectionChange={s.handleDirectionChange}
        method={s.method}
        onMethodChange={s.handleMethodChange}
        period={s.period}
        canEditInvoice={s.canEditInvoice}
        noCredential={!s.portal.hasToken && !s.portal.hasPassword}
        syncing={s.portal.loading}
        onOpenLogin={() => s.setConfigOpen(true)}
        onSync={s.handleSync}
        progress={s.progress}
        gdtResult={
          s.portal.result ? (
            <InvoiceGdtSyncResult result={s.portal.result} />
          ) : undefined
        }
        xmlPanel={
          <InvoiceXmlSyncPanel
            xml={s.xml}
            onOpenInvoice={(id) => s.setViewInvoiceId(id)}
          />
        }
        actions={actions}
      />

      <GdtPortalAuthDrawer
        open={s.configOpen}
        onClose={() => s.setConfigOpen(false)}
        onSuccess={() => s.portal.refreshConfig()}
      />
      <ImportPreviewModal
        open={s.showPreview}
        files={s.xml.files}
        direction={s.xml.direction || "IN"}
        onConfirm={(selectedFiles, manualMatches) => {
          s.setShowPreview(false);
          s.xml.handleImport(selectedFiles, manualMatches);
        }}
        onCancel={() => s.setShowPreview(false)}
      />
      <InvoiceDetailWrapper
        invoiceId={s.viewInvoiceId}
        onClose={() => s.setViewInvoiceId(null)}
      />
      <V2ConfirmModal
        open={s.showDrawerConfirm}
        title={t("syncDrawerCloseTitle", "Đóng mà không lưu?")}
        message={t(
          "syncDrawerCloseMessage",
          "Thay đổi của bạn sẽ không được lưu.",
        )}
        confirmLabel={t("syncDrawerCloseConfirm", "Đóng")}
        cancelLabel={t("syncDrawerCloseCancel", "Tiếp tục chỉnh sửa")}
        variant="danger"
        onConfirm={() => {
          s.setShowDrawerConfirm(false);
          s.doClose();
        }}
        onCancel={() => s.setShowDrawerConfirm(false)}
      />
    </>
  );
}
