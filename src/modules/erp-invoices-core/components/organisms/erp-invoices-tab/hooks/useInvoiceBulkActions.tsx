import React, { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import { type TFunction } from "i18next";
import {
  Building2,
  CheckSquare,
  XSquare,
  GitMerge,
  Download,
} from "lucide-react";

import { V2TableSelectionChip } from "@/v2/shared/components";
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
  const [fileExportDrawerOpen, setFileExportDrawerOpen] = useState(false);

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

  const bulkActionsNode = useMemo(() => {
    if (selectedIds.length === 0) return null;
    return (
      <V2TableSelectionChip
        count={selectedIds.length}
        onClear={() => setRowSelection({})}
        renderMenu={(trigger) => (
          <ActionDropdown
            align="start"
            customTrigger={trigger}
            items={[
              {
                groupLabel: t("bulkAccountingGroup", "Nghiệp vụ & Hạch toán"),
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
                    label: t("bulkPostAll", "Hạch toán hàng loạt"),
                    icon: (
                      <CheckSquare className="w-4 h-4 mr-2 text-muted-foreground" />
                    ),
                    onClick: () => {
                      setBulkPostingMode("post");
                      setBulkPostingModalOpen(true);
                    },
                  },
                  {
                    label: t("bulkSuggestNetOff", "Đề xuất cấn trừ sao kê"),
                    icon: (
                      <GitMerge className="w-4 h-4 mr-2 text-muted-foreground" />
                    ),
                    onClick: () => {
                      setBulkNetOffDrawerOpen(true);
                    },
                  },
                  {
                    label: t("bulkUnpostAll", "Hủy hạch toán hàng loạt"),
                    icon: <XSquare className="w-4 h-4 mr-2 text-red-500" />,
                    onClick: () => {
                      setBulkPostingMode("unpost");
                      setBulkPostingModalOpen(true);
                    },
                  },
                ],
              },
              {
                groupLabel: t("bulkDownloadGroup", "Tải & Xuất tệp"),
                items: [
                  {
                    label: t("bulkExportPdfZip", "Xuất PDF / Tải ZIP"),
                    icon: <Download className="w-4 h-4 mr-2 text-blue-500" />,
                    onClick: () => setFileExportDrawerOpen(true),
                  },
                ],
              },
            ]}
          />
        )}
      />
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
    fileExportDrawerOpen,
    setFileExportDrawerOpen,
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
  };
}
