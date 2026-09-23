import React, { useState, useEffect, useMemo } from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { DatePicker } from "@/shared/components/DatePicker";
import { Combobox } from "@/shared/components/Combobox";
import { RefreshCw } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  getPastMonthPresets,
  getCurrentMonthPreset,
} from "@/shared/utils/datePresets";
import { useGarageStore } from "../store/garageStore";
import {
  useSyncGarageCases,
  useSyncGarageGrossProfit,
} from "../hooks/useGarage";
import { GarageBranchSelector } from "./GarageBranchSelector";
import { useTranslation } from "react-i18next";

interface GarageCaseSyncDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: "cases" | "gross-profit";
  title?: string;
  description?: string;
}

export function GarageCaseSyncDrawer({
  open,
  onClose,
  onSuccess,
  mode = "cases",
  title,
  description,
}: GarageCaseSyncDrawerProps) {
  const { t } = useTranslation("garage");
  const { selectedBranchId } = useGarageStore();
  const { mutateAsync: syncCases, isPending: isSyncingCases } =
    useSyncGarageCases();
  const { mutateAsync: syncGrossProfit, isPending: isSyncingGrossProfit } =
    useSyncGarageGrossProfit();

  const isSyncing = isSyncingCases || isSyncingGrossProfit;

  const initialPreset = useMemo(() => getCurrentMonthPreset(), []);
  const [selectedPreset, setSelectedPreset] = useState<string>(
    initialPreset.presetKey,
  );
  const [dateFrom, setDateFrom] = useState<string>(initialPreset.from);
  const [dateTo, setDateTo] = useState<string>(initialPreset.to);

  const modalTitle =
    title ||
    (mode === "gross-profit"
      ? t("cases.syncDrawer.titleGrossProfit", "Đồng bộ Lợi nhuận gộp Garage")
      : t("cases.syncDrawer.titleCases", "Đồng bộ Cases từ Garage"));

  const modalDesc =
    description ||
    (mode === "gross-profit"
      ? t(
          "cases.syncDrawer.descGrossProfit",
          "Chọn khoảng thời gian để cập nhật lại dữ liệu Doanh thu - Chi phí - Lợi nhuận gộp từ hệ thống Garage.",
        )
      : t(
          "cases.syncDrawer.descCases",
          "Chọn khoảng thời gian để đồng bộ phiếu dịch vụ (Cases) và doanh thu chi phí từ hệ thống Garage về ERP.",
        ));

  const presetOptions = useMemo(() => getPastMonthPresets(2), []);

  const handlePresetChange = (val: string) => {
    setSelectedPreset(val);
    if (!val) return;
    if (val.startsWith("month-")) {
      const parts = val.split("-");
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const d = new Date(y, m, 1);
      setDateFrom(format(startOfMonth(d), "yyyy-MM-dd"));
      setDateTo(format(endOfMonth(d), "yyyy-MM-dd"));
    }
  };

  useEffect(() => {
    if (open) {
      const current = getCurrentMonthPreset();
      setSelectedPreset(current.presetKey);
      setDateFrom(current.from);
      setDateTo(current.to);
    }
  }, [open]);

  const handleSync = async () => {
    if (!selectedBranchId) return;
    try {
      const payload = {
        branchId: selectedBranchId,
        from: dateFrom ? dateFrom : undefined,
        to: dateTo ? dateTo : undefined,
      };
      if (mode === "gross-profit") {
        await syncGrossProfit(payload);
      } else {
        await syncCases(payload);
      }
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch {
      // Error handled in the mutation
    }
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      icon={<RefreshCw className="w-5 h-5" />}
      panelClassName="min-[1024px]:w-[640px]"
      actions={[
        {
          label: t("cases.syncDrawer.close", "Đóng"),
          onClick: onClose,
          variant: "outline",
        },
      ]}
    >
      <div className="flex flex-col h-full">
        {/* Selection Area */}
        <div className="flex items-center gap-3 px-[18px] py-3 border-b border-border shrink-0 -mx-[18px] -mt-[18px] mb-4 bg-muted/30">
          <GarageBranchSelector />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">{modalDesc}</div>

            <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 px-3 py-2.5 text-xs text-sky-700 dark:text-sky-300 flex items-start gap-2">
              <span className="font-semibold shrink-0">ℹ️ Lưu ý:</span>
              <span>
                {t(
                  "cases.syncDrawer.lookbackNotice",
                  "Hệ thống tự động quét mở rộng 2 tháng trước mốc bắt đầu để cập nhật trạng thái và ngày hoàn thành cho các phiếu sửa chữa kéo dài qua nhiều tháng.",
                )}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Combobox
                  options={presetOptions}
                  value={selectedPreset}
                  onChange={handlePresetChange}
                  placeholder={t(
                    "cases.syncDrawer.quickPreset",
                    "Chọn nhanh kỳ...",
                  )}
                  className="flex-1"
                />
                <DatePicker
                  value={dateFrom}
                  onChange={(val) => {
                    setDateFrom(val);
                    setSelectedPreset("");
                  }}
                  placeholder={t("cases.syncDrawer.dateFrom", "Từ ngày")}
                  className="flex-1"
                />
                <DatePicker
                  value={dateTo}
                  onChange={(val) => {
                    setDateTo(val);
                    setSelectedPreset("");
                  }}
                  placeholder={t("cases.syncDrawer.dateTo", "Đến ngày")}
                  className="flex-1"
                />
              </div>

              <div className="flex justify-end items-center mt-2">
                <Button
                  onClick={handleSync}
                  disabled={
                    !selectedBranchId || isSyncing || (!dateFrom && !dateTo)
                  }
                  className="gap-2 w-44 justify-center"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing
                    ? t("cases.syncDrawer.syncing", "Đang xử lý...")
                    : t("cases.syncDrawer.startSync", "Bắt đầu đồng bộ")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DrawerModal>
  );
}
