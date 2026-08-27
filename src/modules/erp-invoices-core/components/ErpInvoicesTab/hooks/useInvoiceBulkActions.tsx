import React, { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import { type TFunction } from "i18next";
import {
  Building2,
  CheckSquare,
  ChevronDown,
  XSquare,
  X,
  GitMerge,
  Download,
} from "lucide-react";

import { Tooltip } from "@/core/components/ui/Tooltip";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface UseInvoiceBulkActionsOptions {
  direction: "IN" | "OUT";
  t: TFunction<any, any>;
}

export function useInvoiceBulkActions({
  direction,
  t,
}: UseInvoiceBulkActionsOptions) {
  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);
  const [bulkMonth, setBulkMonth] = useState("");
  const [bulkTypes, setBulkTypes] = useState<string[]>(["pdf", "xml"]);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkSelectedTypes, setBulkSelectedTypes] = useState<string[]>([
    "pdf",
    "xml",
  ]);
  const [bulkSelectedDownloading, setBulkSelectedDownloading] = useState(false);
  const [bulkSelectedModalOpen, setBulkSelectedModalOpen] = useState(false);

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [bulkEditDrawerOpen, setBulkEditDrawerOpen] = useState(false);
  const [bulkPostingModalOpen, setBulkPostingModalOpen] = useState(false);
  const [bulkNetOffDrawerOpen, setBulkNetOffDrawerOpen] = useState(false);
  const [bulkPostingMode, setBulkPostingMode] = useState<"post" | "unpost">(
    "post",
  );

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((k) => rowSelection[k]),
    [rowSelection],
  );

  const monthOptions = useMemo(() => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      opts.push({
        label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`,
        value: val,
      });
    }
    return opts;
  }, []);

  useEffect(() => {
    if (!bulkMonth && monthOptions.length > 0) {
      setBulkMonth(monthOptions[0].value);
    }
  }, [bulkMonth, monthOptions]);

  const handleBulkDownloadFiles = async () => {
    if (bulkTypes.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 loại file (PDF hoặc XML)");
      return;
    }
    if (!bulkMonth) {
      toast.error("Vui lòng chọn kỳ tải hóa đơn");
      return;
    }
    try {
      setBulkDownloading(true);
      const [year, month] = bulkMonth.split("-");
      const dateFrom = `${year}-${month}-01`;
      const dateTo = new Date(Number(year), Number(month), 0)
        .toISOString()
        .slice(0, 10);

      const blob = await erpInvoicesCoreApi.bulkDownloadFiles({
        query: {
          date_from: dateFrom,
          date_to: dateTo,
          direction,
        },
        types: bulkTypes,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HoaDon_${bulkMonth}_${direction}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBulkDrawerOpen(false);
      toast.success("Tải hàng loạt thành công!");
    } catch (error: any) {
      console.error(error);
      toast.error("Tải hàng loạt thất bại: " + error.message);
    } finally {
      setBulkDownloading(false);
    }
  };

  const handleBulkDownloadSelected = async () => {
    if (bulkSelectedTypes.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 loại file");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Không có hóa đơn nào được chọn");
      return;
    }

    try {
      setBulkSelectedDownloading(true);
      const blob = await erpInvoicesCoreApi.bulkDownloadSelected({
        ids: selectedIds,
        types: bulkSelectedTypes,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HoaDon_${selectedIds.length}_invoices.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBulkSelectedModalOpen(false);
      toast.success(`Đã tải ${selectedIds.length} hóa đơn thành công!`);
    } catch (error: any) {
      toast.error("Tải thất bại: " + error.message);
    } finally {
      setBulkSelectedDownloading(false);
    }
  };

  const bulkActionsNode = useMemo(() => {
    if (selectedIds.length === 0) return null;
    return (
      <div className="inline-flex items-stretch h-8 rounded-lg border border-border bg-surface text-foreground shadow-xs hover:border-primary/40 transition-colors animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
        <Tooltip
          content={`${t("bulkActions", "Thao tác")} (${selectedIds.length})`}
        >
          <div className="h-full">
            <ActionDropdown
              align="start"
              customTrigger={
                <button
                  type="button"
                  className="flex items-center gap-1 h-full pl-2.5 pr-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover hover:text-primary transition-colors outline-none cursor-pointer"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="leading-none text-[11px] text-primary font-bold">
                    ({selectedIds.length})
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                </button>
              }
              items={[
                {
                  groupLabel: "Nghiệp vụ & Hạch toán",
                  items: [
                    {
                      label: t("bulkAssignAll", "Gán hàng loạt"),
                      icon: (
                        <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                      ),
                      onClick: () => {
                        setBulkEditDrawerOpen(true);
                      },
                    },
                    {
                      label: "Hạch toán hàng loạt",
                      icon: (
                        <CheckSquare className="w-4 h-4 mr-2 text-muted-foreground" />
                      ),
                      onClick: () => {
                        setBulkPostingMode("post");
                        setBulkPostingModalOpen(true);
                      },
                    },
                    {
                      label: "Đề xuất cấn trừ sao kê",
                      icon: (
                        <GitMerge className="w-4 h-4 mr-2 text-muted-foreground" />
                      ),
                      onClick: () => {
                        setBulkNetOffDrawerOpen(true);
                      },
                    },
                    {
                      label: "Hủy hạch toán hàng loạt",
                      icon: <XSquare className="w-4 h-4 mr-2 text-red-500" />,
                      onClick: () => {
                        setBulkPostingMode("unpost");
                        setBulkPostingModalOpen(true);
                      },
                    },
                  ],
                },
                {
                  groupLabel: "Tải & Xuất tệp",
                  items: [
                    {
                      label: "Tải ZIP PDF/XML",
                      icon: <Download className="w-4 h-4 mr-2 text-blue-500" />,
                      onClick: () => setBulkSelectedModalOpen(true),
                    },
                  ],
                },
              ]}
            />
          </div>
        </Tooltip>
        <Tooltip
          content={`${t("deselectAll", "Bỏ chọn")} (${selectedIds.length})`}
        >
          <button
            type="button"
            onClick={() => setRowSelection({})}
            className="flex items-center justify-center px-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors outline-none cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      </div>
    );
  }, [selectedIds.length, t]);

  return {
    bulkDrawerOpen,
    setBulkDrawerOpen,
    bulkMonth,
    setBulkMonth,
    bulkTypes,
    setBulkTypes,
    bulkDownloading,
    bulkSelectedTypes,
    setBulkSelectedTypes,
    bulkSelectedDownloading,
    bulkSelectedModalOpen,
    setBulkSelectedModalOpen,
    rowSelection,
    setRowSelection,
    bulkEditDrawerOpen,
    setBulkEditDrawerOpen,
    bulkPostingModalOpen,
    setBulkPostingModalOpen,
    bulkNetOffDrawerOpen,
    setBulkNetOffDrawerOpen,
    bulkPostingMode,
    selectedIds,
    monthOptions,
    bulkActionsNode,
    handleBulkDownloadFiles,
    handleBulkDownloadSelected,
  };
}
