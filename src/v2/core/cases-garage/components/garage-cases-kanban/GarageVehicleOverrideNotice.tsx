import * as React from "react";
import { RotateCcw } from "lucide-react";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface GarageVehicleOverrideNoticeProps {
  /** Có callback và quyền sửa thì hiện nút về trạng thái KGara. */
  onRevert?: () => void;
  disabled?: boolean;
}

/** Báo thẻ xe đã bị đổi trạng thái ở v2 khác với KGara, kèm nút hoàn về. */
export const GarageVehicleOverrideNotice: React.FC<
  GarageVehicleOverrideNoticeProps
> = ({ onRevert, disabled = false }) => {
  const { t } = useV2Translation();
  const hint = t(
    "v2.garageCases.kanban.overriddenHint",
    "Trạng thái khác với KGara. Bấm để về trạng thái KGara.",
  );

  return (
    <div className="flex items-center gap-1" title={hint}>
      <V2Badge
        variant="outline"
        className="h-5 border-primary/30 bg-primary/10 px-1.5 text-[10px] font-medium text-primary"
      >
        {t("v2.garageCases.kanban.overriddenBadge", "Đã chỉnh ở v2")}
      </V2Badge>
      {onRevert ? (
        <V2Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label={t(
            "v2.garageCases.kanban.revertToKgara",
            "Về trạng thái KGara",
          )}
          className="h-5 w-5 p-0 text-muted-fg hover:text-primary"
          onClick={onRevert}
        >
          <RotateCcw className="h-3 w-3" />
        </V2Button>
      ) : null}
    </div>
  );
};
