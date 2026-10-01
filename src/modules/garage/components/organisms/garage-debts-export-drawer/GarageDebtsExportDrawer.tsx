import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { PillTabs } from "@/shared/components/PillTabs";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import { garageApi } from "@/modules/garage/api/garageApi";
import { Download, Users, Truck } from "lucide-react";
import toast from "react-hot-toast";
import type { GarageDebtsExportDrawerProps } from "./GarageDebtsExportDrawer.type";

export const GarageDebtsExportDrawer: React.FC<
  GarageDebtsExportDrawerProps
> = ({ open, onClose, branchId }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const [partnerType, setPartnerType] = useState<"customers" | "suppliers">(
    "customers",
  );
  const [dateFrom, setDateFrom] = useState<string>("2026-07-01");
  const [dateTo, setDateTo] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.loading(
        t("garage:debts.exportLoading", "Đang kết xuất dữ liệu Excel..."),
        { id: "export-garage-debt-toast" },
      );

      // Gọi API xuất dữ liệu từ garageApi
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

        const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
          type: "text/csv;charset=utf-8;",
        });
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = blobUrl;
        a.download = `Bao_cao_cong_no_khach_hang_garage_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        }, 2000);
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

        const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
          type: "text/csv;charset=utf-8;",
        });
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = blobUrl;
        a.download = `Bao_cao_cong_no_nha_cung_cap_garage_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        }, 2000);
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

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("debts:exportDetailed", "Xuất Báo Cáo Công Nợ Garage")}
      subtitle={t(
        "garage:debts.exportSubtitle",
        "Tùy chọn đối tượng, khoảng thời gian và tải xuống bảng kê",
      )}
      layout="1-column"
      size="md"
      leftPanel={
        <div className="space-y-4 p-4 text-xs">
          <DrawerSection title="1. ĐỐI TƯỢNG BÁO CÁO">
            <PillTabs<"customers" | "suppliers">
              value={partnerType}
              onValueChange={setPartnerType}
              items={[
                { value: "customers", label: "Khách hàng", icon: Users },
                {
                  value: "suppliers",
                  label: "Nhà cung cấp / Phụ tùng",
                  icon: Truck,
                },
              ]}
            />
          </DrawerSection>

          <DrawerSection title="2. KHOẢNG THỜI GIAN">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Từ ngày:
                </label>
                <DatePicker value={dateFrom} onChange={setDateFrom} />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Đến ngày:
                </label>
                <DatePicker value={dateTo} onChange={setDateTo} />
              </div>
            </div>
          </DrawerSection>

          <div className="pt-4 flex justify-end gap-2 border-t border-border/70">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isExporting}
            >
              {t("common:cancel", "Đóng")}
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? "Đang xuất..." : "Tải xuống bảng kê"}
            </Button>
          </div>
        </div>
      }
    />
  );
};
