import React from "react";
import { FifoUnitLedgerSection } from "./fifo-unit-ledger/FifoUnitLedgerSection";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { VinfastPartTrendChart } from "../VinfastPartsDashboardPage";

interface VinfastPartsStockDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  sku: string;
  catalogData?: any;
}

export function VinfastPartsStockDetailDrawer({
  open,
  onClose,
  sku,
  catalogData,
}: VinfastPartsStockDetailDrawerProps) {
  const { t } = useTranslation(["vinfastParts", "reports", "common"]);

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("vinfastParts:FIFO_TRACE_LEDGER", "Lịch sử xuất nhập kho")}
      subtitle={`${sku} - ${catalogData?.name || ""}`}
      titleExtra={
        <Badge
          variant={
            catalogData?.vehicleType === "CAR" ? "default" : "secondary"
          }
        >
          {catalogData?.vehicleType === "CAR"
            ? t("vinfastParts:CAR", "Ô tô")
            : t("vinfastParts:MOTORBIKE", "Xe máy")}
        </Badge>
      }
      layout="2-columns"
      size="full"
      panelClassName="w-full lg:w-[calc(100vw-208px)]"
      collapsibleRightPanel={true}
      actions={[{ label: t("common:close", "Đóng"), onClick: onClose }]}
      leftPanel={
        <div className="flex flex-col gap-4">
          <VinfastPartTrendChart
            title={t("vinfastParts:TREND", "Biểu đồ biến động")}
            vehicleType="all"
            filterState={{}}
            groupBy="day"
            itemCode={sku}
            chartHeight={200}
            variant="drawer"
          />
          <FifoUnitLedgerSection sku={sku} />
        </div>
      }
      rightPanel={
        <div className="flex flex-col gap-4">
          <DrawerSection
            title={t("vinfastParts:PART_INFO", "Thông tin phụ tùng")}
          >
            <DrawerRow
              label={t("vinfastParts:PART_SKU", "Mã phụ tùng")}
              value={<span className="font-semibold">{sku}</span>}
            />
            <DrawerRow
              label={t("vinfastParts:UOM", "Đơn vị tính")}
              value={catalogData?.uom}
            />
            <DrawerRow
              label={t("vinfastParts:PART_NAME", "Tên phụ tùng")}
              value={catalogData?.name}
            />
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center justify-center p-2 bg-orange-50/50 rounded-md">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  {t("vinfastParts:TOTAL_IN", "Tổng Nhập")}
                </span>
                <span className="font-semibold text-orange-700 text-base">
                  {Number(catalogData?.qtyIn || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 bg-emerald-50/50 rounded-md">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  {t("vinfastParts:TOTAL_OUT", "Tổng Xuất")}
                </span>
                <span className="font-semibold text-emerald-700 text-base">
                  {Number(catalogData?.qtyOut || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 bg-blue-50/50 rounded-md border border-blue-100">
                <span className="text-[11px] font-medium text-blue-600/80 uppercase tracking-wider mb-1">
                  {t("vinfastParts:BALANCE", "Tồn cuối")}
                </span>
                <span className="font-bold text-blue-700 text-lg">
                  {Number(catalogData?.qtyBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}
