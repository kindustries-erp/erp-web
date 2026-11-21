import * as React from "react";
import { Layers, FileText, CheckCircle2, Car } from "lucide-react";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { money } from "@/shared/utils/format";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { KgaraCaseStatusBadge } from "@/modules/garage/components/KgaraCaseStatusBadge";
import { GarageVehicleCasesPopover } from "./GarageVehicleCasesPopover";
import type { GarageVehicleKanbanItem } from "../../kanban";

export interface GarageVehicleKanbanCardProps {
  item: GarageVehicleKanbanItem;
  laneId: string;
  isOverlay?: boolean;
  onOpenCaseDetail?: (caseCode: string) => void;
}

export const GarageVehicleKanbanCard: React.FC<GarageVehicleKanbanCardProps> =
  React.memo(({ item, isOverlay = false, onOpenCaseDetail }) => {
    const { t } = useV2Translation();

    return (
      <div
        className={cn(
          "p-3 rounded-xl border space-y-2.5",
          "transition-[border-color,background-color,box-shadow] duration-150",
          "bg-surface/90 dark:bg-zinc-900/70 border-border/40 dark:border-white/[0.06]",
          "shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.35)] hover:border-border/70 dark:hover:border-white/12",
          isOverlay && "shadow-2xl border-primary ring-2 ring-primary/40",
        )}
      >
        {/* ── Hàng 1: Biển số xe & Trạng thái phiếu active ── */}
        <div className="flex items-center justify-between gap-1.5">
          <V2Badge
            variant="outline"
            className="bg-amber-400/10 text-amber-950 dark:text-amber-300 border-amber-500/30 dark:border-amber-400/20 font-mono font-bold text-xs px-2 py-0.5 shadow-2xs"
          >
            {item.licensePlate}
          </V2Badge>

          {item.latestStatus ? (
            <KgaraCaseStatusBadge status={item.latestStatus} />
          ) : null}
        </div>

        {/* ── Hàng 2: Tên khách hàng, Thông tin xe & Phiếu dịch vụ ── */}
        <div className="space-y-1">
          <V2Text
            variant="body-sm"
            className="font-semibold text-foreground text-xs truncate block"
            title={item.customerName}
          >
            {item.customerName}
          </V2Text>

          {(item.brandName || item.modelName || item.modelYear) && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-fg font-medium">
              <Car className="w-3 h-3 text-muted-fg shrink-0" />
              <span className="truncate">
                {[item.brandName, item.modelName].filter(Boolean).join(" ")}
                {item.modelYear ? ` · ${item.modelYear}` : ""}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-0.5">
            {item.caseCount > 1 ? (
              <GarageVehicleCasesPopover
                item={item}
                onOpenCaseDetail={onOpenCaseDetail}
                trigger={
                  <V2Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 py-0 text-[11px] font-semibold text-primary hover:bg-primary/10 rounded-md gap-1"
                  >
                    <Layers className="w-3 h-3" />
                    <span>
                      {item.caseCount}{" "}
                      {t("v2.garageCases.kanban.casesSuffix", "phiếu")}
                    </span>
                  </V2Button>
                }
              />
            ) : (
              <V2Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 py-0 font-mono text-[11px] font-bold text-primary hover:underline hover:bg-transparent flex items-center gap-1"
                onClick={() =>
                  onOpenCaseDetail?.(
                    item.latestCaseCode || item.cases[0]?.soChungTu || "",
                  )
                }
              >
                <FileText className="w-3 h-3 text-muted-fg" />
                <span>#{item.latestCaseCode || item.cases[0]?.soChungTu}</span>
              </V2Button>
            )}

            {item.latestDate && (
              <V2Text
                variant="caption"
                className="text-[11px] text-muted-fg font-mono"
              >
                {item.latestDate}
              </V2Text>
            )}
          </div>
        </div>

        {/* ── Hàng 3: Chỉ số tài chính (Doanh thu & Còn nợ) ── */}
        <div className="pt-2 border-t border-border/40 dark:border-white/[0.06] flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <V2Text
              variant="caption"
              className="text-[10px] text-muted-fg uppercase font-medium"
            >
              {t("v2.garageCases.kanban.totalBilled", "Phát sinh")}
            </V2Text>
            <V2Text
              variant="numeric"
              className="font-mono font-bold text-foreground text-xs tabular-nums"
            >
              {money(item.totalBilled)}
            </V2Text>
          </div>

          {item.totalRemaining > 0 ? (
            <div className="flex flex-col items-end">
              <V2Text
                variant="caption"
                className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-medium"
              >
                {t("v2.garageCases.kanban.remaining", "Còn nợ")}
              </V2Text>
              <V2Text
                variant="numeric"
                className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs tabular-nums"
              >
                {money(item.totalRemaining)}
              </V2Text>
            </div>
          ) : (
            <V2Badge
              variant="outline"
              className="text-[10px] h-5 px-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-medium gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{t("v2.garageCases.kanban.paidInFull", "Đã thu đủ")}</span>
            </V2Badge>
          )}
        </div>
      </div>
    );
  });

GarageVehicleKanbanCard.displayName = "GarageVehicleKanbanCard";
