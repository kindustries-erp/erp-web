import * as React from "react";
import { Layers, ExternalLink, Car } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/v2/shared/ui/popover";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { money } from "@/shared/utils/format";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { KgaraCaseStatusBadge } from "@/modules/garage/components/KgaraCaseStatusBadge";
import type { GarageVehicleKanbanItem } from "../../kanban";

export interface GarageVehicleCasesPopoverProps {
  item: GarageVehicleKanbanItem;
  trigger: React.ReactNode;
  onOpenCaseDetail?: (caseCode: string) => void;
}

export const GarageVehicleCasesPopover: React.FC<
  GarageVehicleCasesPopoverProps
> = ({ item, trigger, onOpenCaseDetail }) => {
  const { t } = useV2Translation();
  const [open, setOpen] = React.useState(false);

  const vehicleName = [item.brandName, item.modelName]
    .filter(Boolean)
    .join(" ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className={cn(
          "w-[760px] max-w-[95vw] p-4 space-y-3 z-50 rounded-2xl",
          "bg-popover dark:bg-zinc-900/98 backdrop-blur-md",
          "border border-border/70 dark:border-zinc-700/80",
          "shadow-2xl dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)]",
        )}
      >
        {/* ── Popover Header ── */}
        <div className="flex items-center justify-between pb-2.5 border-b border-border/50 dark:border-white/[0.08]">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <V2Badge
              variant="outline"
              className="bg-amber-400/15 text-amber-950 dark:text-amber-200 border-amber-500/40 font-mono font-bold text-xs px-2 py-0.5"
            >
              {item.licensePlate}
            </V2Badge>
            <V2Text
              variant="label"
              className="text-xs font-semibold text-foreground truncate max-w-[180px]"
            >
              {item.customerName}
            </V2Text>
            {(vehicleName || item.modelYear) && (
              <V2Badge
                variant="secondary"
                className="text-[11px] font-medium gap-1 h-5 px-1.5"
              >
                <Car className="w-3 h-3 text-muted-fg" />
                <span>
                  {vehicleName || "—"}
                  {item.modelYear ? ` · ${item.modelYear}` : ""}
                </span>
              </V2Badge>
            )}
          </div>
          <V2Badge
            variant="secondary"
            className="text-[11px] font-semibold h-6 px-2 shrink-0"
          >
            <Layers className="w-3.5 h-3.5 mr-1 text-muted-fg" />
            {item.caseCount} {t("v2.garageCases.kanban.casesSuffix", "phiếu")}
          </V2Badge>
        </div>

        {/* ── Table Danh Sách Phiếu ── */}
        <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-lg border border-border/50 dark:border-white/[0.08]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-hover/70 dark:bg-zinc-800/60 sticky top-0 z-10 border-b border-border/50 dark:border-white/[0.08]">
              <tr className="text-[11px] text-muted-fg font-semibold uppercase tracking-wider">
                <th className="py-2 px-2.5 text-center w-10">#</th>
                <th className="py-2 px-2.5">
                  {t("v2.garageCases.kanban.colCaseCode", "Số phiếu")}
                </th>
                <th className="py-2 px-2.5">
                  {t("v2.garageCases.kanban.colLicensePlate", "Biển số xe")}
                </th>
                <th className="py-2 px-2.5">
                  {t("v2.garageCases.kanban.colChassis", "Số khung")}
                </th>
                <th className="py-2 px-2.5">
                  {t("v2.garageCases.kanban.colVehicleType", "Loại xe")}
                </th>
                <th className="py-2 px-2.5 text-center">
                  {t("v2.garageCases.kanban.colModelYear", "Đời xe")}
                </th>
                <th className="py-2 px-2.5 text-center">
                  {t("v2.garageCases.kanban.colStatus", "Trạng thái")}
                </th>
                <th className="py-2 px-2.5 text-right">
                  {t("v2.garageCases.kanban.colAmount", "Số tiền")}
                </th>
                <th className="py-2 px-2.5 text-right">
                  {t("v2.garageCases.kanban.colRemaining", "Còn nợ")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 dark:divide-white/[0.05] bg-surface/30">
              {item.cases.map((c, idx) => (
                <tr
                  key={c.id || c.rowKey}
                  className="hover:bg-surface-hover/60 transition-colors"
                >
                  <td className="py-2 px-2.5 text-center text-muted-fg font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <V2Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-mono font-bold text-xs text-primary hover:underline inline-flex items-center gap-1"
                      onClick={() => {
                        setOpen(false);
                        onOpenCaseDetail?.(c.soChungTu || c.id);
                      }}
                    >
                      <span>{c.soChungTu}</span>
                      <ExternalLink className="w-3 h-3 text-muted-fg shrink-0" />
                    </V2Button>
                  </td>
                  <td className="py-2 px-2.5 font-mono font-medium text-foreground whitespace-nowrap">
                    {c.bienSoXe || item.licensePlate}
                  </td>
                  <td className="py-2 px-2.5 font-mono text-[11px] text-muted-fg whitespace-nowrap">
                    {c.soKhung || item.chassisNumber || "—"}
                  </td>
                  <td className="py-2 px-2.5 text-foreground whitespace-nowrap">
                    {[c.hangXeName, c.dongXeName].filter(Boolean).join(" ") ||
                      vehicleName ||
                      "—"}
                  </td>
                  <td className="py-2 px-2.5 text-center font-mono text-muted-fg whitespace-nowrap">
                    {c.namSanXuat || item.modelYear || "—"}
                  </td>
                  <td className="py-2 px-2.5 text-center whitespace-nowrap">
                    {c.serviceStatus ? (
                      <KgaraCaseStatusBadge status={c.serviceStatus} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                    {money(c.billed)}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-semibold whitespace-nowrap">
                    {c.remaining > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        {money(c.remaining)}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        0 ₫
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Popover Footer Summary ── */}
        <div className="pt-2 border-t border-border/50 dark:border-white/[0.08] flex items-center justify-between text-xs flex-wrap gap-2">
          <span className="text-[11px] text-muted-fg italic">
            {t(
              "v2.garageCases.kanban.popoverHint",
              "Bấm vào số phiếu để mở xem chi tiết vụ việc",
            )}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-fg">
                {t("v2.garageCases.kanban.totalBilled", "Phát sinh")}:
              </span>
              <span className="font-mono font-bold text-foreground">
                {money(item.totalBilled)}
              </span>
            </div>
            {item.totalRemaining > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {t("v2.garageCases.kanban.remaining", "Còn nợ")}:
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {money(item.totalRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
