import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { InvoiceXmlImportModal as ImportPreviewModal } from "@/modules/erp-invoices-core/components/organisms/invoice-xml-import-modal";
import { InvoiceDetailWrapper } from "@/modules/erp-invoices-core/components/organisms/invoice-detail-wrapper";
import { GdtPortalAuthDrawer } from "@/modules/erp-invoices-core/components/organisms/gdt-portal-auth-drawer";
import type { Direction } from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";
import { InvoiceGdtSyncPanel } from "./InvoiceGdtSyncPanel";
import { InvoiceSyncProgressSection } from "./InvoiceSyncProgressSection";
import { InvoiceXmlSyncPanel } from "./InvoiceXmlSyncPanel";
import {
  buildInvoiceSyncActions,
  type InvoiceSyncMethod,
} from "./invoiceSyncDrawer.actions";
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
    t: (key, fallback) => t(key, fallback),
  });

  const actions = buildInvoiceSyncActions({
    method: s.method,
    xmlStep: s.xml.step,
    fileCount: s.xml.files.length,
    createdCount: s.xml.result?.created ?? null,
    labels: {
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
    },
  });

  return (
    <>
      <V2StandardDrawer
        open={open}
        onClose={s.doClose}
        title="Đồng bộ hóa đơn"
        icon={<RefreshCw className="h-5 w-5" />}
        size="md"
        layout="1-column"
        fillHeight
        actions={actions}
        confirmOnClose={s.hasPendingXml}
        leftPanel={
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <V2Combobox
                options={[
                  { value: "IN", label: t("inbound", "Hóa đơn mua vào") },
                  { value: "OUT", label: t("outbound", "Hóa đơn bán ra") },
                ]}
                value={s.direction}
                onValueChange={(v) =>
                  v && s.handleDirectionChange(v as Direction)
                }
                searchable={false}
              />
              <V2Combobox
                options={[
                  { value: "GDT", label: "Từ hệ thống GDT" },
                  { value: "XML", label: "Tải file từ máy tính" },
                ]}
                value={s.method}
                onValueChange={(v) =>
                  v && s.handleMethodChange(v as InvoiceSyncMethod)
                }
                searchable={false}
              />
            </div>

            {s.method === "GDT" ? (
              <div className="flex min-h-0 flex-1 flex-col gap-6">
                <InvoiceGdtSyncPanel
                  portal={s.portal}
                  canEditInvoice={s.canEditInvoice}
                  presetOptions={s.presetOptions}
                  selectedPreset={s.selectedPreset}
                  setSelectedPreset={s.setSelectedPreset}
                  bulkXmlLoading={s.bulkXmlLoading}
                  onOpenConfig={() => s.setConfigOpen(true)}
                  onBulkXml={s.handleBulkXml}
                  onSync={s.handleSync}
                />
                <InvoiceSyncProgressSection />
              </div>
            ) : (
              <InvoiceXmlSyncPanel
                xml={s.xml}
                onOpenInvoice={(id) => s.setViewInvoiceId(id)}
              />
            )}
          </div>
        }
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
        title="Đóng mà không lưu?"
        message="Thay đổi của bạn sẽ không được lưu."
        confirmLabel="Đóng"
        cancelLabel="Tiếp tục chỉnh sửa"
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
