import * as React from "react";
import { Layers, Car } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/v2/shared/ui/popover";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { money } from "@/shared/utils/format";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { GarageVehicleCasesTable } from "./GarageVehicleCasesTable";
import { GarageVoucherNameText } from "../../customer";
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
    <Popover modal={false} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        onWheel={(e) => e.stopPropagation()}
        className={cn(
          "w-[760px] max-w-[95vw] p-4 space-y-3 z-50 rounded-2xl",
          "bg-popover border border-border shadow-2xl",
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
            <GarageVoucherNameText
              customerName={item.customerName}
              voucherName={item.voucherCustomerName}
              className="text-xs max-w-[180px]"
            />
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

        <GarageVehicleCasesTable
          item={item}
          vehicleName={vehicleName}
          onOpenCase={(code) => {
            setOpen(false);
            onOpenCaseDetail?.(code);
          }}
        />

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
