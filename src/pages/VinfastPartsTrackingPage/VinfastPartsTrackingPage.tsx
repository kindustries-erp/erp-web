import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";
import {
  ErpInvoiceInternalSidebar,
  ErpInvoiceInternalMain,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { ErpInvoicePdfUpload } from "@/modules/erp-invoices-core/components/ErpInvoicePdfUpload";
import { VinfastPartsExportDrawer } from "@/pages/components/VinfastPartsExportDrawer";
import { VinfastPartsSyncDrawer } from "@/pages/components/VinfastPartsSyncDrawer";

import type { VinfastPartsTrackingPageProps } from "./types";
import { useVinfastPartsTrackingLogic } from "./useVinfastPartsTrackingLogic";
import { VinfastPartDetailDrawer } from "./components/VinfastPartDetailDrawer";

export function VinfastPartsTrackingPage(props: VinfastPartsTrackingPageProps) {
  const { t } = useTranslation("vinfast");
  const {
    vehicleType,
    page,
    setPage,
    pageSize,
    setPageSize,
    exportDrawerOpen,
    setExportDrawerOpen,
    syncDrawerOpen,
    setSyncDrawerOpen,
    detailRow,
    setDetailRow,
    tableState,
    filterState,
    formHook,
    data,
    isLoading,
    isFetching,
    refetch,
    summaryRow,
    columns,
    createActions,
    buildExportBaseQuery,
  } = useVinfastPartsTrackingLogic(props);

  return (
    <>
      <SpreadsheetPageTemplate
        title={
          vehicleType === "CAR"
            ? t("reportTitleCar", "Báo cáo phụ tùng Ô tô VINFAST")
            : vehicleType === "MOTORBIKE"
              ? t("reportTitleMotorbike", "Báo cáo phụ tùng Xe máy VINFAST")
              : t("reportTitleAll", "Báo cáo phụ tùng VINFAST")
        }
        desc={
          vehicleType === "CAR"
            ? t(
                "reportDescCar",
                "Tổng hợp và đối chiếu phụ tùng ô tô mua vào từ VINFAST và bán ra theo tháng",
              )
            : vehicleType === "MOTORBIKE"
              ? t(
                  "reportDescMotorbike",
                  "Tổng hợp và đối chiếu phụ tùng xe máy mua vào từ VINFAST và bán ra theo tháng",
                )
              : t(
                  "reportDescAll",
                  "Tổng hợp và đối chiếu phụ tùng mua vào từ VINFAST và bán ra theo tháng",
                )
        }
        icon={<FileText className="w-4 h-4 opacity-75" />}
        tableId={`vinfast-parts-${vehicleType || "all"}`}
        createActions={createActions}
        items={data?.data || []}
        columns={columns as any}
        summaryRow={summaryRow}
        getRowKey={(row: any) => `${row.itemCode}-${row.itemName}-${row.month}`}
        loading={isLoading || isFetching}
        emptyLabel={t("common.noData", "Chưa có dữ liệu")}
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        totalPages={Math.ceil((data?.total || 0) / pageSize) || 1}
        onPage={setPage}
        onPageSize={setPageSize}
        sortArray={tableState.sorts}
        onSort={(key) => {
          tableState.toggleSort(key);
          setPage(1);
        }}
        onRefresh={() => refetch()}
        activeFilterCount={tableState.activeFilterCount || 0}
        onClearAllFilters={() => {
          tableState.resetFilters();
          setPage(1);
        }}
      />

      <ErpInvoiceInternalDrawer
        open={formHook.internalDrawerOpen}
        onClose={formHook.closeDrawer}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        cancelEdit={formHook.cancelEdit}
        rightPanel={
          <div className="flex flex-col gap-5">
            <ErpInvoiceInternalSidebar
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key: string, value: any) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              invoiceId={formHook.detailInvoice?.id ?? null}
              pendingTagIds={formHook.pendingTagIds}
              onPendingTagsChange={formHook.setPendingTagIds}
              direction={formHook.detailInvoice?.direction || "IN"}
              detailInvoice={formHook.detailInvoice}
              onRefreshDetail={formHook.handleSyncDetail}
              pdfSlot={
                <ErpInvoicePdfUpload
                  invoiceId={formHook.detailInvoice?.id ?? null}
                  attachments={formHook.detailInvoice?.pdfFiles ?? null}
                  editMode={formHook.editMode}
                />
              }
            />
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <ErpInvoiceInternalMain
            form={formHook.form}
            editMode={formHook.editMode}
            fieldSet={(key: string, value: any) =>
              formHook.setForm((prev) => ({ ...prev, [key]: value }))
            }
            direction={formHook.detailInvoice?.direction || "IN"}
            detailInvoice={formHook.detailInvoice}
            postingState={formHook.postingState}
            pendingUnpost={formHook.pendingUnpost}
            onUnpost={() => formHook.setPendingUnpost(true)}
            onRefreshDetail={() => {
              if (formHook.detailInvoice?.id) {
                formHook.openInternal({ id: formHook.detailInvoice.id } as any);
              }
            }}
            invoicePreview={
              formHook.detailInvoice ? (
                <div className="flex justify-center bg-slate-100 p-8 min-h-full">
                  <VietnamInvoiceTemplate invoice={formHook.detailInvoice} />
                </div>
              ) : undefined
            }
          />
        </div>
      </ErpInvoiceInternalDrawer>

      <VinfastPartsExportDrawer
        open={exportDrawerOpen}
        onClose={() => setExportDrawerOpen(false)}
        buildBaseQuery={buildExportBaseQuery}
        initialDateFrom={filterState.dateFrom}
        initialDateTo={filterState.dateTo}
      />

      <VinfastPartsSyncDrawer
        open={syncDrawerOpen}
        onClose={() => setSyncDrawerOpen(false)}
      />

      <VinfastPartDetailDrawer
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        itemCode={detailRow?.itemCode || ""}
        itemName={detailRow?.itemName || ""}
        month={detailRow?.month || ""}
        onOpenInvoice={(id) => formHook.openInternal({ id } as any)}
      />
    </>
  );
}
