import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import {
  erpInvoicesCoreApi,
  ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { toast } from "react-hot-toast";
import { money, formatGMT7 } from "@/shared/utils/format";
import {
  Search,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
} from "lucide-react";
import { cn } from "@/shared/utils";

interface InvoiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseCode?: string;
  defaultLinkType?: "IN" | "OUT";
  onSuccess: () => void;
  onSubmit: (payload: {
    invoiceId: string;
    linkType: "IN" | "OUT";
    note?: string;
  }) => Promise<void>;
}

export function InvoiceSelectionModal({
  isOpen,
  onClose,
  caseId,
  caseCode,
  defaultLinkType = "OUT",
  onSuccess,
  onSubmit,
}: InvoiceSelectionModalProps) {
  const [linkType, setLinkType] = useState<"IN" | "OUT">(defaultLinkType);
  const [search, setSearch] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<ErpInvoice | null>(
    null,
  );
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["erp-invoices-lookup", linkType, search],
    queryFn: () =>
      erpInvoicesCoreApi.list({
        page: 1,
        pageSize: 20,
        direction: linkType,
        search: search || undefined,
      }),
    enabled: isOpen,
  });

  const handleSelectInvoice = (inv: ErpInvoice) => {
    setSelectedInvoice(inv);
  };

  const handleSave = async () => {
    if (!selectedInvoice) {
      toast.error("Vui lòng chọn 1 hóa đơn để liên kết");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        invoiceId: selectedInvoice.id,
        linkType,
        note: note || undefined,
      });

      toast.success(
        `Đã liên kết thành công HĐ ${selectedInvoice.invoiceNo} với vụ việc!`,
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể liên kết hóa đơn");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Liên kết Hóa đơn VAT với Phiếu dịch vụ
          </DialogTitle>
          <DialogDescription>
            Chọn Hóa đơn điện tử đầu ra (Doanh thu) hoặc đầu vào (Chi phí) để
            đối soát 2 chiều với Sổ báo giá {caseCode ? `(${caseCode})` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 1. Chọn HĐ Đầu ra hay Đầu vào */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setLinkType("OUT");
                setSelectedInvoice(null);
              }}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-xl border font-medium text-sm transition-all",
                linkType === "OUT"
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-sm"
                  : "border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:text-slate-400",
              )}
            >
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
              Hóa đơn Bán ra (Doanh thu dịch vụ)
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkType("IN");
                setSelectedInvoice(null);
              }}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-xl border font-medium text-sm transition-all",
                linkType === "IN"
                  ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-sm"
                  : "border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:text-slate-400",
              )}
            >
              <ArrowDownLeft className="w-4 h-4 text-amber-600" />
              Hóa đơn Mua vào (Chi phí phụ tùng/vật tư)
            </button>
          </div>

          {/* 2. Ô tìm kiếm */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm theo số hóa đơn, ký hiệu, đối tác, biển số xe..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* 3. Danh sách Hóa đơn */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <div className="text-xs text-center py-6 text-slate-400">
                  Đang tải danh sách hóa đơn...
                </div>
              ) : invoiceData?.items && invoiceData.items.length > 0 ? (
                invoiceData.items.map((inv: ErpInvoice) => {
                  const isSelected = selectedInvoice?.id === inv.id;
                  const partner =
                    inv.direction === "IN" ? inv.sellerName : inv.buyerName;

                  return (
                    <div
                      key={inv.id}
                      onClick={() => handleSelectInvoice(inv)}
                      className={cn(
                        "p-3 flex items-center justify-between cursor-pointer transition-all text-xs",
                        isSelected
                          ? "bg-blue-50/80 dark:bg-blue-950/40 font-medium"
                          : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50",
                      )}
                    >
                      <div className="space-y-1 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            Số: {inv.invoiceNo || "---"}
                          </span>
                          {inv.serialNo && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                              Ký hiệu: {inv.serialNo}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            {formatGMT7(inv.invoiceDate, "date")}
                          </span>
                        </div>
                        <div className="text-slate-500 truncate">
                          {partner || "Khách lẻ"}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {money(Number(inv.totalAmount || 0))}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {inv.status || "CONFIRMED"}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-center py-6 text-slate-400">
                  Không tìm thấy hóa đơn nào phù hợp
                </div>
              )}
            </div>
          </div>

          {/* Ghi chú liên kết */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Ghi chú liên kết
            </label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNote(e.target.value)
              }
              placeholder="Ghi chú mục đích liên kết hóa đơn này với báo giá..."
              className="text-xs resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedInvoice || isSubmitting}
          >
            {isSubmitting ? "Đang liên kết..." : "Xác nhận liên kết"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
