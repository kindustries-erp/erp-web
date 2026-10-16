import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, SlidersHorizontal, Car } from "lucide-react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";

export type CaseStatusFilterValue = "ALL" | "COMPLETED" | "IN_PROGRESS";

export interface VehicleOption {
  licensePlate: string;
  count: number;
  balance: number;
}

interface CustomerCaseFilterPopoverProps {
  vehicles: VehicleOption[];
  selectedPlate: string | null;
  onSelectPlate: (plate: string | null) => void;
  selectedStatus: CaseStatusFilterValue;
  onSelectStatus: (status: CaseStatusFilterValue) => void;
  statusCounts: {
    all: number;
    completed: number;
    inProgress: number;
  };
  filteredCount: number;
  debtType?: "receivables" | "payables";
  className?: string;
}

export const CustomerCaseFilterPopover = React.memo(
  function CustomerCaseFilterPopover({
    vehicles,
    selectedPlate,
    onSelectPlate,
    selectedStatus,
    onSelectStatus,
    statusCounts,
    filteredCount,
    debtType = "receivables",
    className,
  }: CustomerCaseFilterPopoverProps) {
    const { t } = useTranslation(["garage", "debts", "common"]);
    const [open, setOpen] = useState(false);
    const isPayables = debtType === "payables";

    // Tính toán text hiển thị tóm tắt trên nút trigger
    const triggerLabel = useMemo(() => {
      const plateText =
        !selectedPlate || selectedPlate === "ALL"
          ? t("customers.allVehiclesShort", "Tất cả xe")
          : selectedPlate;

      let statusText = t("customers.statusAllShort", "Tất cả");
      if (selectedStatus === "COMPLETED") {
        statusText = t("customers.statusCompletedShort", "Hoàn thành");
      } else if (selectedStatus === "IN_PROGRESS") {
        statusText = isPayables
          ? t("customers.statusInProgressPayablesShort", "Đang làm (dự chi)")
          : t("customers.statusInProgressShort", "Đang làm");
      }

      return `${plateText} · ${statusText}`;
    }, [selectedPlate, selectedStatus, isPayables, t]);

    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              "h-8 px-2.5 inline-flex items-center gap-1.5 rounded-full text-xs font-medium shrink-0 cursor-pointer",
              "bg-slate-100/90 hover:bg-slate-200/80 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/80",
              "border border-slate-200/80 dark:border-zinc-700/80 shadow-[0_1px_2px_rgba(15,23,42,.04)]",
              "text-slate-700 dark:text-zinc-200 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/40",
              className,
            )}
            title={triggerLabel}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[150px] sm:max-w-[190px] font-mono text-xs">
              {triggerLabel}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-muted-foreground bg-slate-200/80 dark:bg-slate-700/80 border border-slate-300/60 dark:border-slate-600/60 shrink-0">
              {filteredCount} {t("customers.casesUnit", "phiếu")}
            </span>
            <ChevronDown
              className={cn(
                "w-3 h-3 text-slate-400 dark:text-zinc-500 transition-transform duration-200 shrink-0",
                open && "rotate-180",
              )}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={6}
            className="z-[9999] w-72 rounded-xl border border-slate-200/90 dark:border-zinc-700/90 bg-white dark:bg-zinc-900 backdrop-blur-md p-2 shadow-xl text-xs space-y-1.5 animate-in fade-in-0 zoom-in-95"
          >
            {/* ── Nhóm 1: Phương tiện / Biển số xe ── */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                <Car className="w-3 h-3 text-primary" />
                <span>
                  {t(
                    "customers.filterGroup.vehicle",
                    "Phương tiện / Biển số xe",
                  )}
                </span>
              </div>

              <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                {/* Lựa chọn: Tất cả phương tiện */}
                <div
                  className={cn(
                    "flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                    !selectedPlate || selectedPlate === "ALL"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20"
                      : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300",
                  )}
                  onClick={() => onSelectPlate(null)}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {(!selectedPlate || selectedPlate === "ALL") && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="truncate font-medium">
                      {t("customers.allVehicles", "Tất cả phương tiện")}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 shrink-0">
                    {vehicles.length} {t("customers.vehiclesUnit", "xe")}
                  </span>
                </div>

                {/* Danh sách từng xe */}
                {vehicles.map((v) => {
                  const isSelected = selectedPlate === v.licensePlate;
                  return (
                    <div
                      key={v.licensePlate}
                      className={cn(
                        "flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary font-medium dark:bg-primary/20"
                          : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300",
                      )}
                      onClick={() => onSelectPlate(v.licensePlate)}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-mono font-semibold text-xs">
                            {v.licensePlate}
                          </span>
                          {v.balance > 0 ? (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 leading-tight">
                              {isPayables ? "phải trả" : "nợ"}{" "}
                              {money(v.balance)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 leading-tight">
                              {t("customers.filter.paid", "Đã thu đủ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 shrink-0 self-start mt-0.5">
                        {v.count} {t("customers.casesUnit", "phiếu")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Đường phân cách ── */}
            <div className="my-1 border-t border-slate-200/80 dark:border-zinc-800/80" />

            {/* ── Nhóm 2: Trạng thái phiếu ── */}
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                {t("customers.filterGroup.status", "Trạng thái phiếu")}
              </div>

              <div className="space-y-0.5">
                {/* Tất cả trạng thái */}
                <div
                  className={cn(
                    "flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                    selectedStatus === "ALL"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20"
                      : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300",
                  )}
                  onClick={() => onSelectStatus("ALL")}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {selectedStatus === "ALL" && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="truncate">
                      {t("customers.statusFilter.all", "Tất cả trạng thái")}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 shrink-0">
                    {statusCounts.all} {t("customers.casesUnit", "phiếu")}
                  </span>
                </div>

                {/* Đã hoàn thành */}
                <div
                  className={cn(
                    "flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                    selectedStatus === "COMPLETED"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20"
                      : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300",
                  )}
                  onClick={() => onSelectStatus("COMPLETED")}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {selectedStatus === "COMPLETED" && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="truncate">
                      {t("customers.statusFilter.completed", "Đã hoàn thành")}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 shrink-0">
                    {statusCounts.completed} {t("customers.casesUnit", "phiếu")}
                  </span>
                </div>

                {/* Xe đang làm */}
                <div
                  className={cn(
                    "flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                    selectedStatus === "IN_PROGRESS"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20"
                      : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300",
                  )}
                  onClick={() => onSelectStatus("IN_PROGRESS")}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {selectedStatus === "IN_PROGRESS" && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="truncate">
                      {isPayables
                        ? t(
                            "customers.statusFilter.inProgressPayables",
                            "Xe đang làm (Dự chi)",
                          )
                        : t(
                            "customers.statusFilter.inProgress",
                            "Xe đang làm (Dự thu)",
                          )}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 shrink-0">
                    {statusCounts.inProgress}{" "}
                    {t("customers.casesUnit", "phiếu")}
                  </span>
                </div>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

export default CustomerCaseFilterPopover;
