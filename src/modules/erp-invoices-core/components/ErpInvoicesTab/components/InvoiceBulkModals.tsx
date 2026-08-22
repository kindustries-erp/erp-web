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

export function InvoiceBulkModals({
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
            primary: true,
            disabled: bulkSelectedDownloading,
            loading: bulkSelectedDownloading,
          },
        ]}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Đã chọn <strong>{selectedIds.length}</strong> hóa đơn. Hệ thống sẽ
            nén PDF/XML của các hóa đơn này thành 1 file ZIP.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Định dạng file tải về *
            </label>
            <div className="flex flex-col gap-3 mt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={bulkSelectedTypes.includes("pdf")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBulkSelectedTypes((prev) =>
                        prev.includes("pdf") ? prev : [...prev, "pdf"],
                      );
                    } else {
                      setBulkSelectedTypes((prev) =>
                        prev.filter((t) => t !== "pdf"),
                      );
                    }
                  }}
                />
                <span className="text-sm">File PDF</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={bulkSelectedTypes.includes("xml")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBulkSelectedTypes((prev) =>
                        prev.includes("xml") ? prev : [...prev, "xml"],
                      );
                    } else {
                      setBulkSelectedTypes((prev) =>
                        prev.filter((t) => t !== "xml"),
                      );
                    }
                  }}
                />
                <span className="text-sm">File XML</span>
              </label>
            </div>
          </div>
        </div>
      </DrawerModal>

      <DrawerModal
        open={bulkDrawerOpen}
        onClose={() => setBulkDrawerOpen(false)}
        title="Tải hàng loạt hóa đơn"
        actions={[
          {
            label: "Hủy",
            onClick: () => setBulkDrawerOpen(false),
            variant: "outline" as const,
            disabled: bulkDownloading,
          },
          {
            label: bulkDownloading ? "Đang nén file..." : "Xác nhận tải",
            onClick: handleBulkDownloadFiles,
            primary: true,
            disabled: bulkDownloading,
            loading: bulkDownloading,
          },
        ]}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kỳ tải hóa đơn *</label>
            <Combobox
              options={monthOptions}
              value={bulkMonth}
              onChange={(v) => setBulkMonth(v ?? "")}
              placeholder="Chọn kỳ..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hệ thống sẽ tải toàn bộ hóa đơn trong tháng đã chọn để tránh quá
              tải.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Định dạng file tải về *
            </label>
            <div className="flex flex-col gap-3 mt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={bulkTypes.includes("pdf")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBulkTypes((prev) => [...prev, "pdf"]);
                    } else {
                      setBulkTypes((prev) => prev.filter((t) => t !== "pdf"));
                    }
                  }}
                />
                <span className="text-sm">File PDF</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={bulkTypes.includes("xml")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBulkTypes((prev) => [...prev, "xml"]);
                    } else {
                      setBulkTypes((prev) => prev.filter((t) => t !== "xml"));
                    }
                  }}
                />
                <span className="text-sm">File XML</span>
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
}
