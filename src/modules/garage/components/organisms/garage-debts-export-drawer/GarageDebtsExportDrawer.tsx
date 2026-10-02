import React from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { PillTabs } from "@/shared/components/PillTabs";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import { Download, Users, Truck } from "lucide-react";
import type { GarageDebtsExportDrawerProps } from "./GarageDebtsExportDrawer.type";
import { useGarageDebtsExportDrawer } from "./GarageDebtsExportDrawer.hook";

export const GarageDebtsExportDrawer: React.FC<
  GarageDebtsExportDrawerProps
> = ({ open, onClose, branchId }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const {
    partnerType,
    setPartnerType,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    isExporting,
    handleExport,
  } = useGarageDebtsExportDrawer({ branchId, onClose });

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
