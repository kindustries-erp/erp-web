import React from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { money } from "@/shared/utils/format";
import {
  ErpInvoiceInternalDrawer,
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "../erp-invoice-detail-drawer";
import { type PartnerInvoiceDrawerProps } from "./PartnerInvoiceDrawer.type";
import { usePartnerInvoiceDrawer } from "./PartnerInvoiceDrawer.hook";

export function PartnerInvoiceDrawer({
  open,
  onClose,
  taxCode,
  partnerName,
  filterState,
}: PartnerInvoiceDrawerProps) {
  const {
    isLoadingStats,
    listHook,
    formHook,
    columns,
    barIn,
    barOut,
    cashTrendLabels,
    cashTrendIn,
    cashTrendOut,
  } = usePartnerInvoiceDrawer({
    open,
    taxCode,
    filterState,
  });

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={`Chi tiết đối tác: ${taxCode}${partnerName ? ` - ${partnerName}` : ""}`}
      panelClassName="min-[1024px]:w-[calc(100vw-280px)] w-full max-w-[90vw]"
      bodyClassName="flex flex-col p-4"
    >
      <div className="flex flex-col gap-6 h-full min-h-0">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-800">
            Tổng quan Hóa đơn
          </h3>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="relative h-[210px]">
              {!isLoadingStats && cashTrendLabels.length > 0 ? (
                <BarChart
                  labels={cashTrendLabels}
                  yCallback={(v) => money(Number(v))}
                  datasets={[
                    {
                      data: cashTrendIn,
                      color: barIn, // Đầu vào -> Cam
                      label: "HĐ Đầu vào",
                    },
                    {
                      data: cashTrendOut,
                      color: barOut, // Đầu ra -> Xanh lục
                      label: "HĐ Đầu ra",
                    },
                  ]}
                />
              ) : isLoadingStats ? (
                <ChartSkeleton type="bar" />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                  Chưa có dữ liệu
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-2 justify-center">
              <div className="flex items-center text-xs">
                <div
                  className="w-3 h-3 rounded-[3px] mr-2"
                  style={{ backgroundColor: barIn }}
                />
                <span className="text-[color:var(--muted-fg)]">HĐ Đầu vào</span>
              </div>
              <div className="flex items-center text-xs">
                <div
                  className="w-3 h-3 rounded-[3px] mr-2"
                  style={{ backgroundColor: barOut }}
                />
                <span className="text-[color:var(--muted-fg)]">HĐ Đầu ra</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <h3 className="text-sm font-semibold mb-3 text-slate-800">
            Danh sách Hóa đơn
          </h3>
          <div className="flex-1 min-h-0 flex flex-col">
            <StandardTable
              items={listHook.invoices}
              columns={columns}
              getRowKey={(r) => r.id}
              loading={listHook.loading}
              variant="spreadsheet"
              minWidth={800}
              enableColumnResizing={true}
              page={listHook.page}
              pageSize={listHook.pageSize}
              total={listHook.total}
              totalPages={listHook.totalPages}
              onPage={listHook.setPage}
              onPageSize={listHook.setPageSize}
            />
          </div>
        </div>
      </div>

      <ErpInvoiceInternalDrawer
        open={formHook.internalDrawerOpen}
        onClose={formHook.closeDrawer}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        cancelEdit={formHook.cancelEdit}
        form={formHook.form}
        fieldSet={(key: string, value: any) =>
          formHook.setForm((prev) => ({ ...prev, [key]: value }))
        }
        direction={formHook.form.direction || "IN"}
        postingState={formHook.postingState}
        pendingUnpost={formHook.pendingUnpost}
        onUnpost={() => formHook.setPendingUnpost(true)}
        rightPanel={
          <div className="flex flex-col gap-4">
            <ErpInvoiceInternalSidebar
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key: string, value: any) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              invoiceId={formHook.detailInvoice?.id ?? null}
              pendingTagIds={formHook.pendingTagIds}
              onPendingTagsChange={formHook.setPendingTagIds}
              direction={formHook.form.direction || "IN"}
              detailInvoice={formHook.detailInvoice}
              onRefreshDetail={formHook.handleSyncDetail}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <ErpInvoiceInternalMain detailInvoice={formHook.detailInvoice} />
        </div>
      </ErpInvoiceInternalDrawer>

      <ConfirmModal
        open={formHook.deleteConfirm}
        onCancel={() => formHook.setDeleteConfirm(false)}
        title="Xóa hóa đơn"
        message={`Bạn có chắc muốn xóa hóa đơn ${formHook.detailInvoice?.invoiceNo}? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
        loading={formHook.saving}
        onConfirm={formHook.handleDelete}
      />

      <ConfirmModal
        open={formHook.cancelConfirm}
        onCancel={() => formHook.setCancelConfirm(false)}
        title="Hủy hóa đơn"
        message={`Bạn có chắc muốn hủy hóa đơn ${formHook.detailInvoice?.invoiceNo}?`}
        confirmLabel="Đồng ý hủy"
        danger
        loading={formHook.saving}
        onConfirm={formHook.handleCancel}
      />
    </DrawerModal>
  );
}
export default PartnerInvoiceDrawer;
