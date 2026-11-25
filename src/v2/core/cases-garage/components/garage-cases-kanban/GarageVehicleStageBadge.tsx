import * as React from "react";
import { Wrench } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/v2/shared/ui/popover";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import {
  GARAGE_CASE_STAGES,
  GARAGE_STAGE_LABELS,
  type GarageCaseStage,
} from "../../kanban";

export interface GarageVehicleStageBadgeProps {
  stage: GarageCaseStage | null | undefined;
  /** Không có quyền hoặc đang ghi: chỉ hiển thị, không mở danh sách chọn. */
  disabled?: boolean;
  onSelect?: (stage: GarageCaseStage | null) => void;
}

/** Badge công đoạn sửa chữa; bấm để chọn công đoạn khác hoặc bỏ công đoạn. */
export const GarageVehicleStageBadge: React.FC<
  GarageVehicleStageBadgeProps
> = ({ stage, disabled = false, onSelect }) => {
  const { t } = useV2Translation();
  const [open, setOpen] = React.useState(false);
  const label = stage
    ? t(GARAGE_STAGE_LABELS[stage].key, GARAGE_STAGE_LABELS[stage].defaultLabel)
    : t("v2.garageCases.kanban.stageNone", "Chưa chọn công đoạn");

  const badge = (
    <V2Badge
      variant="outline"
      className={cn(
        "h-5 gap-1 px-1.5 text-[10px] font-medium",
        stage
          ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
          : "text-muted-fg",
      )}
    >
      <Wrench className="h-3 w-3" />
      <span>{label}</span>
    </V2Badge>
  );
  if (disabled || !onSelect) return badge;

  const pick = (next: GarageCaseStage | null) => {
    setOpen(false);
    onSelect(next);
  };

  return (
    <Popover modal={false} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={label} className="cursor-pointer">
          {badge}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 space-y-0.5 p-1.5">
        {GARAGE_CASE_STAGES.map((s) => (
          <V2Button
            key={s}
            variant={s === stage ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-full justify-start px-2 text-xs"
            onClick={() => pick(s)}
          >
            {t(GARAGE_STAGE_LABELS[s].key, GARAGE_STAGE_LABELS[s].defaultLabel)}
          </V2Button>
        ))}
        {stage ? (
          <V2Button
            variant="ghost"
            size="sm"
            className="h-7 w-full justify-start px-2 text-xs text-muted-fg"
            onClick={() => pick(null)}
          >
            {t("v2.garageCases.kanban.stageClear", "Bỏ công đoạn")}
          </V2Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};
