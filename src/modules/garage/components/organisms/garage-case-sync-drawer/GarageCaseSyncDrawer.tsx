import React from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { DatePicker } from "@/shared/components/DatePicker";
import { Combobox } from "@/shared/components/Combobox";
import { RefreshCw } from "lucide-react";
import { GarageBranchSelector } from "../../GarageBranchSelector";
import { GarageCaseSyncDrawerProps } from "./GarageCaseSyncDrawer.type";
import { useGarageCaseSyncDrawerLogic } from "./GarageCaseSyncDrawer.hook";

export function GarageCaseSyncDrawer(props: GarageCaseSyncDrawerProps) {
  const { open, onClose, mode = "all" } = props;
  const {
    t,
    selectedBranchId,
    isSyncing,
    selectedPreset,
    dateFrom,
    dateTo,
    force,
    includeDetails,
    modalTitle,
    modalDesc,
    presetOptions,
    setSelectedPreset,
    setDateFrom,
    setDateTo,
    setForce,
    setIncludeDetails,
    handlePresetChange,
    handleSync,
  } = useGarageCaseSyncDrawerLogic(props);

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
        <div className="flex items-center gap-3 px-[18px] py-3 border-b border-border shrink-0 -mx-[18px] -mt-[18px] mb-4 bg-muted/30">
          <GarageBranchSelector />
        </div>

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

              {mode === "all" && (
                <div className="flex flex-col gap-2 pt-1 border-t border-border/50">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeDetails}
                      onChange={(e) => setIncludeDetails(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-xs text-foreground font-medium">
                      {t(
                        "cases.syncDrawer.includeDetails",
                        "Bao gồm tải chi tiết vật tư phụ tùng & nhân công",
                      )}
                    </span>
                  </label>
                  {includeDetails && (
                    <label className="flex items-center gap-2 cursor-pointer select-none ml-6">
                      <input
                        type="checkbox"
                        checked={force}
                        onChange={(e) => setForce(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-xs text-muted-foreground">
                        {t(
                          "cases.syncDrawer.forceDetails",
                          "Tải lại cả những phiếu đã có chi tiết (force)",
                        )}
                      </span>
                    </label>
                  )}
                </div>
              )}

              {mode === "case-details" && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="force-sync-details"
                    checked={force}
                    onChange={(e) => setForce(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <label
                    htmlFor="force-sync-details"
                    className="text-xs text-foreground cursor-pointer select-none"
                  >
                    {t(
                      "cases.syncDrawer.forceDetails",
                      "Đồng bộ lại toàn bộ (tải lại cả những phiếu đã có chi tiết)",
                    )}
                  </label>
                </div>
              )}

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
export default GarageCaseSyncDrawer;
