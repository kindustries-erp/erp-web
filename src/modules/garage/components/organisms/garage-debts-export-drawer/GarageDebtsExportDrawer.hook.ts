import { useState } from "react";
import { useTranslation } from "react-i18next";
import { garageApi } from "@/modules/garage/api/garageApi";
import toast from "react-hot-toast";

interface UseGarageDebtsExportDrawerProps {
  branchId?: string;
  onClose: () => void;
}

export function useGarageDebtsExportDrawer({
  branchId,
  onClose,
}: UseGarageDebtsExportDrawerProps) {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const [partnerType, setPartnerType] = useState<"customers" | "suppliers">(
    "customers",
  );
  const [dateFrom, setDateFrom] = useState<string>("2026-07-01");
  const [dateTo, setDateTo] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [isExporting, setIsExporting] = useState(false);

  const downloadCsv = (filename: string, csvContent: string) => {
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.loading(
        t("garage:debts.exportLoading", "Đang kết xuất dữ liệu Excel..."),
        { id: "export-garage-debt-toast" },
      );

      if (partnerType === "customers") {
        const res = await garageApi.getCustomersDebt({
          branchId,
          page: 1,
          pageSize: 5000,
          from: dateFrom,
          to: dateTo,
        });
        const items = res.data || [];
        if (items.length === 0) {
          toast.error("Không có dữ liệu công nợ trong khoảng thời gian này", {
            id: "export-garage-debt-toast",
          });
          setIsExporting(false);
          return;
        }

        const headers = [
          "Mã KH",
          "Tên KH",
          "Số phiếu",
          "Tổng doanh thu",
          "Đã thu",
          "Còn phải thu",
          "Nợ 0-30 ngày",
          "Nợ 31-60 ngày",
          "Nợ 61-90 ngày",
          "Nợ >90 ngày",
          "Tuổi nợ max",
          "Ngày gần nhất",
        ];
        const csvRows = [headers.join(",")];
        for (const r of items) {
          csvRows.push(
            [
              `"${r.customerCode || ""}"`,
              `"${(r.customerName || "").replace(/"/g, '""')}"`,
              r.caseCount,
              r.totalAmount,
              r.paidAmount,
              r.balanceAmount,
              r.aging0_30,
              r.aging31_60,
              r.aging61_90,
              r.agingOver90,
              r.maxAgingDays,
              `"${r.latestDate ? r.latestDate.slice(0, 10) : ""}"`,
            ].join(","),
          );
        }
        downloadCsv(
          `Bao_cao_cong_no_khach_hang_garage_${new Date().toISOString().slice(0, 10)}.csv`,
          csvRows.join("\n"),
        );
      } else {
        const res = await garageApi.getSuppliersDebt({
          branchId: branchId || "",
          page: 1,
          pageSize: 5000,
          from: dateFrom,
          to: dateTo,
        });
        const items = res.data || [];
        if (items.length === 0) {
          toast.error(
            "Không có dữ liệu công nợ NCC trong khoảng thời gian này",
            {
              id: "export-garage-debt-toast",
            },
          );
          setIsExporting(false);
          return;
        }

        const headers = [
          "Mã NCC",
          "Tên NCC",
          "Số vụ việc",
          "Phải trả",
          "Đã trả",
          "Còn nợ",
          "Nợ 0-30 ngày",
          "Nợ 31-60 ngày",
          "Nợ 61-90 ngày",
          "Nợ >90 ngày",
          "Tuổi nợ max",
        ];
        const csvRows = [headers.join(",")];
        for (const r of items) {
          csvRows.push(
            [
              `"${r.supplierCode || ""}"`,
              `"${(r.supplierName || "").replace(/"/g, '""')}"`,
              r.caseCount,
              r.ckCo || r.psCo,
              r.ckNo || r.psNo,
              r.balanceAmount,
              r.aging0_30,
              r.aging31_60,
              r.aging61_90,
              r.agingOver90,
              r.maxAgingDays,
            ].join(","),
          );
        }
        downloadCsv(
          `Bao_cao_cong_no_nha_cung_cap_garage_${new Date().toISOString().slice(0, 10)}.csv`,
          csvRows.join("\n"),
        );
      }

      toast.success(
        t("common:exportSuccess", "Đã xuất bảng kê công nợ thành công."),
        {
          id: "export-garage-debt-toast",
        },
      );
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Xuất báo cáo thất bại", {
        id: "export-garage-debt-toast",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    partnerType,
    setPartnerType,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    isExporting,
    handleExport,
  };
}
