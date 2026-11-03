import React, { useMemo } from "react";
import { FifoUnitLedgerSection } from "./fifo-unit-ledger/FifoUnitLedgerSection";
import { useTranslation } from "react-i18next";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { ReceiptText, TrendingUp } from "lucide-react";
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

  const drawerTabs: DrawerTopTabItem[] = useMemo(
    () => [
      {
        key: "ledger",
        label: t("vinfastParts:DETAIL_TAB", "Chi tiết"),
        icon: <ReceiptText className="w-3.5 h-3.5" />,
        content: (
          <div className="space-y-4 pb-4">
            <FifoUnitLedgerSection sku={sku} />
          </div>
        ),
      },
      {
        key: "trend",
        label: t("vinfastParts:TREND_ANALYSIS_TAB", "Biến động & Phân tích"),
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        content: (
          <div className="space-y-4 pb-4">
            <VinfastPartTrendChart
              title={t("vinfastParts:TREND", "Biểu đồ biến động")}
              vehicleType="all"
              filterState={{}}
              groupBy="day"
              itemCode={sku}
              chartHeight={360}
              variant="drawer"
            />
          </div>
        ),
      },
    ],
    [t, sku],
  );

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("vinfastParts:FIFO_TRACE_LEDGER", "Lịch sử xuất nhập kho")}
      subtitle={`${sku} - ${catalogData?.name || ""}`}
      titleExtra={
        <Badge
          variant={catalogData?.vehicleType === "CAR" ? "default" : "secondary"}
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
      enableFullscreen={true}
      actions={[{ label: t("common:close", "Đóng"), onClick: onClose }]}
      tabs={drawerTabs}
      defaultTabKey="ledger"
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
              <div className="flex flex-col items-center justify-center p-2 bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-900/40 rounded-md">
                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  {t("vinfastParts:TOTAL_IN", "Tổng Nhập")}
                </span>
                <span className="font-semibold text-orange-700 dark:text-orange-400 text-base">
                  {Number(catalogData?.qtyIn || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/40 rounded-md">
                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  {t("vinfastParts:TOTAL_OUT", "Tổng Xuất")}
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-base">
                  {Number(catalogData?.qtyOut || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 bg-slate-100/70 dark:bg-zinc-900/60 rounded-md border border-slate-200/80 dark:border-zinc-800">
                <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  {t("vinfastParts:BALANCE", "Tồn cuối")}
                </span>
                <span className="font-bold text-foreground text-lg tabular-nums">
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
