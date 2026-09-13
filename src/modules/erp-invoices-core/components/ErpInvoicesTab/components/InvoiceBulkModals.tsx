import React from "react";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { BulkEditDrawer } from "@/modules/erp-invoices-core/components/BulkEditDrawer";
import { InvoiceBulkPostingDrawer } from "@/modules/erp-invoices-core/components/InvoiceBulkPostingDrawer";
import { InvoiceBulkNetOffDrawer } from "@/modules/erp-invoices-core/components/InvoiceBulkNetOffDrawer";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface InvoiceBulkModalsProps {
  direction: "IN" | "OUT";
  invoices: ErpInvoice[];
  branches: Array<{ value: string; label: string }>;
  selectedIds: string[];
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  loadInvoices: () => Promise<any>;
  // Bulk Selected ZIP
  bulkSelectedModalOpen: boolean;
  setBulkSelectedModalOpen: (open: boolean) => void;
  bulkSelectedDownloading: boolean;
  bulkSelectedTypes: string[];
  setBulkSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
  handleBulkDownloadSelected: () => Promise<void>;
  // Bulk Month ZIP
  bulkDrawerOpen: boolean;
  setBulkDrawerOpen: (open: boolean) => void;
  bulkDownloading: boolean;
  bulkMonth: string;
  setBulkMonth: (month: string) => void;
  bulkTypes: string[];
  setBulkTypes: React.Dispatch<React.SetStateAction<string[]>>;
  monthOptions: Array<{ label: string; value: string }>;
  handleBulkDownloadFiles: () => Promise<void>;
  // Bulk Edit
  bulkEditDrawerOpen: boolean;
  setBulkEditDrawerOpen: (open: boolean) => void;
  // Bulk Posting
  bulkPostingModalOpen: boolean;
  setBulkPostingModalOpen: (open: boolean) => void;
  bulkPostingMode: "post" | "unpost";
  // Bulk Netoff
  bulkNetOffDrawerOpen: boolean;
  setBulkNetOffDrawerOpen: (open: boolean) => void;
}

export const InvoiceBulkModals = React.memo(function InvoiceBulkModals({
  direction,
  invoices,
  branches,
  selectedIds,
  setRowSelection,
  loadInvoices,
  bulkSelectedModalOpen,
  setBulkSelectedModalOpen,
  bulkSelectedDownloading,
  bulkSelectedTypes,
  setBulkSelectedTypes,
  handleBulkDownloadSelected,
  bulkDrawerOpen,
  setBulkDrawerOpen,
  bulkDownloading,
  bulkMonth,
  setBulkMonth,
  bulkTypes,
  setBulkTypes,
  monthOptions,
  handleBulkDownloadFiles,
  bulkEditDrawerOpen,
  setBulkEditDrawerOpen,
  bulkPostingModalOpen,
  setBulkPostingModalOpen,
  bulkPostingMode,
  bulkNetOffDrawerOpen,
  setBulkNetOffDrawerOpen,
}: InvoiceBulkModalsProps) {
  const onBulkOperationSuccess = () => {
    setRowSelection({});
    void loadInvoices();
  };

  return (
    <>
      <DrawerModal
        open={bulkSelectedModalOpen}
        onClose={() => setBulkSelectedModalOpen(false)}
        title={`Tải ZIP ${selectedIds.length} hóa đơn đã chọn`}
        actions={[
          {
            label: "Hủy",
            onClick: () => setBulkSelectedModalOpen(false),
            variant: "outline" as const,
            disabled: bulkSelectedDownloading,
          },
          {
            label: bulkSelectedDownloading
              ? "Đang nén file..."
              : "Xác nhận tải",
            onClick: handleBulkDownloadSelected,
            disabled: bulkSelectedDownloading,
          },
        ]}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Hệ thống sẽ tổng hợp toàn bộ các file hóa đơn được chọn thành 1 file
            nén .zip để tải về. Vui lòng chọn loại file:
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Checkbox
                checked={bulkSelectedTypes.includes("pdf")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setBulkSelectedTypes([...bulkSelectedTypes, "pdf"]);
                  } else {
                    setBulkSelectedTypes(
                      bulkSelectedTypes.filter((t) => t !== "pdf"),
                    );
                  }
                }}
              />
              <span>File PDF (Bản thể hiện hóa đơn)</span>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Checkbox
                checked={bulkSelectedTypes.includes("xml")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setBulkSelectedTypes([...bulkSelectedTypes, "xml"]);
                  } else {
                    setBulkSelectedTypes(
                      bulkSelectedTypes.filter((t) => t !== "xml"),
                    );
                  }
                }}
              />
              <span>File XML (Dữ liệu gốc hóa đơn điện tử)</span>
            </label>
          </div>
        </div>
      </DrawerModal>

      <DrawerModal
        open={bulkDrawerOpen}
        onClose={() => setBulkDrawerOpen(false)}
        title="Tải hàng loạt hóa đơn theo tháng"
        actions={[
          {
            label: "Hủy",
            onClick: () => setBulkDrawerOpen(false),
            variant: "outline" as const,
            disabled: bulkDownloading,
          },
          {
            label: bulkDownloading ? "Đang xử lý..." : "Bắt đầu tải",
            onClick: handleBulkDownloadFiles,
            disabled: bulkDownloading,
          },
        ]}
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium mb-1">Chọn tháng</label>
            <Combobox
              options={monthOptions}
              value={bulkMonth}
              onChange={setBulkMonth}
              placeholder="Chọn tháng..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Loại file tải</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <Checkbox
                  checked={bulkTypes.includes("pdf")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBulkTypes([...bulkTypes, "pdf"]);
                    } else {
                      setBulkTypes(bulkTypes.filter((t) => t !== "pdf"));
                    }
                  }}
                />
                <span>File PDF (Bản thể hiện hóa đơn)</span>
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <Checkbox
                  checked={bulkTypes.includes("xml")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBulkTypes([...bulkTypes, "xml"]);
                    } else {
                      setBulkTypes(bulkTypes.filter((t) => t !== "xml"));
                    }
                  }}
                />
                <span>File XML (Dữ liệu gốc hóa đơn điện tử)</span>
              </label>
            </div>
          </div>
        </div>
      </DrawerModal>

      <BulkEditDrawer
        open={bulkEditDrawerOpen}
        onClose={() => setBulkEditDrawerOpen(false)}
        selectedIds={selectedIds}
        invoices={invoices}
        branches={branches}
        onSuccess={() => {
          setBulkEditDrawerOpen(false);
          onBulkOperationSuccess();
        }}
      />

      <InvoiceBulkPostingDrawer
        open={bulkPostingModalOpen}
        mode={bulkPostingMode}
        onClose={() => setBulkPostingModalOpen(false)}
        selectedInvoiceIds={selectedIds}
        invoices={invoices}
        direction={direction}
        onSuccess={() => {
          setBulkPostingModalOpen(false);
          onBulkOperationSuccess();
        }}
      />

      <InvoiceBulkNetOffDrawer
        open={bulkNetOffDrawerOpen}
        onClose={() => setBulkNetOffDrawerOpen(false)}
        selectedInvoiceIds={selectedIds}
        invoices={invoices}
        direction={direction}
        onSuccess={() => {
          setBulkNetOffDrawerOpen(false);
          onBulkOperationSuccess();
        }}
      />
    </>
  );
});
