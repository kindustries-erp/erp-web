import React, { useState } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
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
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export interface InvoiceSelectionDrawerProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  caseCode?: string;
  defaultLinkType?: "IN" | "OUT";
  onSuccess?: () => void;
  onSubmit: (payload: {
    invoiceId: string;
    linkType: "IN" | "OUT";
    note?: string;
    invoice?: ErpInvoice;
  }) => Promise<void> | void;
}

export function InvoiceSelectionDrawer({
  open,
  onClose,
  caseCode,
  defaultLinkType = "OUT",
  onSuccess,
  onSubmit,
}: InvoiceSelectionDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);
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
        pageSize: 30,
        direction: linkType,
        search: search || undefined,
      }),
    enabled: open,
  });

  const handleSelectInvoice = (inv: ErpInvoice) => {
    setSelectedInvoice(inv);
  };

  const handleSave = async () => {
    if (!selectedInvoice) {
      toast.error(
        t(
          "cases.invoiceDrawer.selectPrompt",
          "Vui lòng chọn 1 hóa đơn để liên kết",
        ),
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        invoiceId: selectedInvoice.id,
        linkType,
        note: note || undefined,
        invoice: selectedInvoice,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Lỗi liên kết",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const actions = [
    {
      label: t("common:cancel", "Hủy"),
      variant: "outline" as const,
      disabled: isSubmitting,
      onClick: onClose,
    },
    {
      label: isSubmitting
        ? t("cases.invoiceDrawer.linking", "Đang liên kết...")
        : t("cases.invoiceDrawer.confirm", "Xác nhận liên kết"),
      primary: true,
      disabled: !selectedInvoice || isSubmitting,
      onClick: handleSave,
    },
  ];

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("cases.invoiceDrawer.title", "Liên kết Hóa đơn VAT")}
      subtitle={
        caseCode
          ? t("cases.invoiceDrawer.subtitle", {
              code: caseCode,
              defaultValue: `Đối soát 2 chiều với Sổ báo giá ${caseCode}`,
            })
          : undefined
      }
      icon={<Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      layout="1-column"
      size="lg"
      actions={actions}
      leftPanel={
        <div className="space-y-4 py-1">
          {/* Segmented Animated Pill Tabs (Dashboard style) */}
          <Tabs
            value={linkType}
            onValueChange={(val) => {
              setLinkType(val as "IN" | "OUT");
              setSelectedInvoice(null);
            }}
            className="w-full"
          >
            <TabsList className="w-full h-10 rounded-full bg-slate-100/80 dark:bg-slate-800/80 p-1 gap-1.5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
              <TabsTrigger
                value="OUT"
                className={cn(
                  "group relative flex-1 shrink-0 rounded-full px-3 h-full gap-0 transition-all duration-150 ease-out cursor-pointer",
                  "data-[state=inactive]:text-slate-500 data-[state=inactive]:font-medium hover:text-slate-700 dark:data-[state=inactive]:text-slate-400",
                  "data-[state=active]:text-blue-700 data-[state=active]:font-semibold dark:data-[state=active]:text-blue-300",
                )}
              >
                <ArrowUpRight
                  className={cn(
                    "shrink-0 transition-[width,height,opacity,margin] duration-150 ease-out overflow-hidden",
                    "w-0 h-0 opacity-0 mr-0",
                    "group-data-[state=active]:w-3.5 group-data-[state=active]:h-3.5 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-1.5",
                  )}
                />
                <span className="text-xs font-semibold tracking-tight truncate">
                  {t(
                    "cases.invoiceDrawer.tabs.out",
                    "1. Hóa đơn Bán ra (Doanh thu)",
                  )}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="IN"
                className={cn(
                  "group relative flex-1 shrink-0 rounded-full px-3 h-full gap-0 transition-all duration-150 ease-out cursor-pointer",
                  "data-[state=inactive]:text-slate-500 data-[state=inactive]:font-medium hover:text-slate-700 dark:data-[state=inactive]:text-slate-400",
                  "data-[state=active]:text-amber-700 data-[state=active]:font-semibold dark:data-[state=active]:text-amber-300",
                )}
              >
                <ArrowDownLeft
                  className={cn(
                    "shrink-0 transition-[width,height,opacity,margin] duration-150 ease-out overflow-hidden",
                    "w-0 h-0 opacity-0 mr-0",
                    "group-data-[state=active]:w-3.5 group-data-[state=active]:h-3.5 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-1.5",
                  )}
                />
                <span className="text-xs font-semibold tracking-tight truncate">
                  {t(
                    "cases.invoiceDrawer.tabs.in",
                    "2. Hóa đơn Mua vào (Chi phí)",
                  )}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Ô tìm kiếm */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={t(
                "cases.invoiceDrawer.searchPlaceholder",
                "Tìm theo số hóa đơn, ký hiệu, đối tác, biển số xe...",
              )}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Danh sách Hóa đơn */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <div className="text-xs text-center py-8 text-slate-400">
                  {t(
                    "cases.invoiceDrawer.loading",
                    "Đang tải danh sách hóa đơn...",
                  )}
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
                          ? "bg-blue-50/80 dark:bg-blue-950/40 border-l-2 border-blue-600 font-medium"
                          : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50",
                      )}
                    >
                      <div className="space-y-1 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {t("cases.invoiceDrawer.invoiceNo", "Số")}:{" "}
                            {inv.invoiceNo || "---"}
                          </span>
                          {inv.serialNo && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono">
                              {t("cases.invoiceDrawer.serialNo", "Ký hiệu")}:{" "}
                              {inv.serialNo}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatGMT7(inv.invoiceDate, "date")}
                          </span>
                        </div>
                        <div className="text-slate-500 truncate">
                          {partner ||
                            t("cases.invoiceDrawer.retailCustomer", "Khách lẻ")}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100 tabular-nums">
                            {money(Number(inv.totalAmount || 0))}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {inv.status || "CONFIRMED"}
                          </span>
                        </div>
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-center py-8 text-slate-400">
                  {t(
                    "cases.invoiceDrawer.empty",
                    "Không tìm thấy hóa đơn nào phù hợp",
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ghi chú liên kết */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t("cases.invoiceDrawer.note", "Ghi chú liên kết")}
            </label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNote(e.target.value)
              }
              placeholder={t(
                "cases.invoiceDrawer.notePlaceholder",
                "Ghi chú mục đích liên kết hóa đơn này với báo giá...",
              )}
              className="text-xs resize-none"
            />
          </div>
        </div>
      }
    />
  );
}
