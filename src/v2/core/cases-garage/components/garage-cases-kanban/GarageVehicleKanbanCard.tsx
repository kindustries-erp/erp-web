import * as React from "react";
import { Layers, FileText, Car } from "lucide-react";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { KgaraCaseStatusBadge } from "@/modules/garage/components/KgaraCaseStatusBadge";
import { GarageVehicleCasesPopover } from "./GarageVehicleCasesPopover";
import { GarageVehicleFinanceRow } from "./GarageVehicleFinanceRow";
import { GarageVehicleStageBadge } from "./GarageVehicleStageBadge";
import { GarageVehicleOverrideNotice } from "./GarageVehicleOverrideNotice";
import type { GarageCaseStage, GarageVehicleKanbanItem } from "../../kanban";

export interface GarageVehicleKanbanCardProps {
  item: GarageVehicleKanbanItem;
  laneId: string;
  isOverlay?: boolean;
  onOpenCaseDetail?: (caseCode: string) => void;
  /** Có quyền sửa: cho phép đổi công đoạn và hoàn về trạng thái KGara. */
  canEdit?: boolean;
  onChangeStage?: (
    item: GarageVehicleKanbanItem,
    stage: GarageCaseStage | null,
  ) => void;
  onRevertStatus?: (item: GarageVehicleKanbanItem) => void;
}

export const GarageVehicleKanbanCard: React.FC<GarageVehicleKanbanCardProps> =
  React.memo(
    ({
      item,
      laneId,
      isOverlay = false,
      onOpenCaseDetail,
      canEdit = false,
      onChangeStage,
      onRevertStatus,
    }) => {
      const { t } = useV2Translation();

      return (
        <div
          className={cn(
            "p-3 rounded-xl border space-y-2.5",
            "transition-[border-color,background-color,box-shadow] duration-150",
            "bg-kanban-card border-kanban-card-border shadow-card-item hover:border-border hover:shadow-card-item-hover",
            isOverlay &&
              "shadow-kanban-drag border-kanban-drag-border bg-kanban-drag ring-1 ring-border/20",
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
                  <span>
                    #{item.latestCaseCode || item.cases[0]?.soChungTu}
                  </span>
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

          {(laneId === "IN_PROGRESS" || item.statusOverridden) && (
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              {laneId === "IN_PROGRESS" ? (
                <GarageVehicleStageBadge
                  stage={item.progressStage}
                  disabled={!canEdit || isOverlay}
                  onSelect={
                    onChangeStage ? (st) => onChangeStage(item, st) : undefined
                  }
                />
              ) : (
                <span />
              )}
              {item.statusOverridden ? (
                <GarageVehicleOverrideNotice
                  disabled={!canEdit || isOverlay}
                  onRevert={
                    canEdit && onRevertStatus
                      ? () => onRevertStatus(item)
                      : undefined
                  }
                />
              ) : null}
            </div>
          )}

          <GarageVehicleFinanceRow
            totalBilled={item.totalBilled}
            totalRemaining={item.totalRemaining}
          />
        </div>
      );
    },
  );

GarageVehicleKanbanCard.displayName = "GarageVehicleKanbanCard";
